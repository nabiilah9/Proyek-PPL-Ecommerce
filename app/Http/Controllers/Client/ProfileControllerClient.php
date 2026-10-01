<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Models\Address; // Import Address model
use App\Models\Contact; // Import Contact model

class ProfileControllerClient extends Controller
{
    public function show()
    {
        $user = Auth::user();
        // Eager load contact and its plural addresses
        $user->load('contact.addresses');

        $contact = $user->contact;
        // Pass the collection of addresses
        $addresses = $contact ? $contact->addresses : collect(); // Ensure it's a collection, even if empty

        return Inertia::render('clients/ProfilePage', [ // Filename adjusted to ProfilePage
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
            ],
            'contact' => $contact ? [
                'id' => $contact->id,
                'phone' => $contact->phone,
                'gender' => $contact->gender,
                'birthday' => $contact->birthday,
                'profile' => $contact->profile,
            ] : null,
            'addresses' => $addresses->map(function ($address) { // Map to array for frontend
                return [
                    'id' => $address->id,
                    'post_code' => $address->post_code,
                    'country' => $address->country,
                    'province' => $address->province,
                    'city' => $address->city,
                    'street' => $address->street,
                    'more' => $address->more,
                ];
            })->all(), // Convert collection to plain array
        ]);
    }

    public function update(Request $request)
    {
        // dd($request->all()); // Uncomment this line temporarily for debugging if needed

        $user = Auth::user();

        // Validate user and contact data
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:MAN,WOMAN',
            'birthday' => 'nullable|date',
            'profile' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',

            // Validation for addresses array
            'addresses' => 'nullable|array', // Allow addresses to be an empty array or not present
            'addresses.*.id' => 'nullable|integer|exists:addresses,id', // Optional ID for existing addresses
            // All address fields are nullable if the address block is empty, but required if part of it is filled
            'addresses.*.post_code' => 'nullable|string|max:10',
            'addresses.*.country' => 'nullable|string|max:100',
            'addresses.*.province' => 'nullable|string|max:100',
            'addresses.*.city' => 'nullable|string|max:100',
            'addresses.*.street' => 'nullable|string|max:200',
            'addresses.*.more' => 'nullable|string|max:50',
        ]);

        // Update user data
        $userData = [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
        ];
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }
        $user->update($userData);

        // Handle profile image upload/removal
        $contact = $user->contact; // Get the current contact or null
        $profilePath = $contact ? $contact->profile : null; // Keep existing path if no new file

        if ($request->hasFile('profile')) {
            // Delete old profile image if exists and a new one is uploaded
            if ($profilePath && Storage::disk('public')->exists($profilePath)) {
                Storage::disk('public')->delete($profilePath);
            }
            $profilePath = $request->file('profile')->store('profiles', 'public');
        } elseif ($request->boolean('profile_removed')) { // Check the boolean flag from frontend
            // If profile_removed is true, delete the old image and set path to null
            if ($profilePath && Storage::disk('public')->exists($profilePath)) {
                Storage::disk('public')->delete($profilePath);
            }
            $profilePath = null;
        }

        // Update or create contact
        // Ensure user_id is set for contact creation if it doesn't exist
        $contactData = [
            'user_id' => $user->id,
            'name' => $request->name, // Re-using user's name for contact's name
            'phone' => $request->phone ?? '',
            'gender' => $request->gender ?? 'MAN',
            'birthday' => $request->birthday ?? now()->format('Y-m-d'),
        ];

        // Only update 'profile' field in contact data if a new file was uploaded or it was explicitly removed
        if ($request->hasFile('profile') || $request->boolean('profile_removed')) {
            $contactData['profile'] = $profilePath;
        }

        if ($contact) {
            $contact->update($contactData);
        } else {
            $contact = $user->contact()->create($contactData);
        }

        // --- Handle Multiple Addresses ---
        // Ensure contact exists before processing addresses
        if ($contact) {
            // Get IDs of addresses currently associated with this contact in the database
            $currentAddressIds = $contact->addresses->pluck('id')->toArray();
            $submittedAddressIds = [];

            // Process submitted addresses from the request
            if ($request->has('addresses') && is_array($request->addresses)) {
                foreach ($request->addresses as $addressData) {
                    // Trim whitespace from all string fields in addressData
                    $addressData = array_map(function($value) {
                        return is_string($value) ? trim($value) : $value;
                    }, $addressData);

                    // Check if this address block has any meaningful data (excluding 'id')
                    $meaningfulFields = array_filter($addressData, function($value, $key) {
                        return $key !== 'id' && !empty($value);
                    }, ARRAY_FILTER_USE_BOTH);

                    if (!empty($meaningfulFields)) { // Only process if the address block is not entirely empty
                        if (isset($addressData['id']) && $addressData['id']) {
                            // Update existing address
                            $address = Address::find($addressData['id']);
                            // Important: Ensure the address belongs to this contact to prevent security issues
                            if ($address && $address->contact_id === $contact->id) {
                                $address->update($addressData);
                                $submittedAddressIds[] = $address->id;
                            }
                            // If address not found or doesn't belong to this contact, it's skipped.
                            // You might want to log this or return an error if strict.
                        } else {
                            // Create new address
                            $newAddress = $contact->addresses()->create($addressData);
                            $submittedAddressIds[] = $newAddress->id;
                        }
                    }
                }
            }

            // Delete addresses that were in DB but not submitted in the form
            $addressesToDelete = array_diff($currentAddressIds, $submittedAddressIds);
            if (!empty($addressesToDelete)) {
                // Ensure deletion only for addresses belonging to this contact
                Address::whereIn('id', $addressesToDelete)
                       ->where('contact_id', $contact->id)
                       ->delete();
            }
        }

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }
}
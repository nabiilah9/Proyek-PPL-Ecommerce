import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { LoaderCircle, Eye, EyeOff, ChevronLeft, UserPlus } from "lucide-react"
import { useForm, usePage } from "@inertiajs/react"
import type { BreadcrumbItem, SharedData } from "@/types"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/elements/button"
import Separator from "@/components/elements/separator"
import Label from "@/components/elements/label"
import Input from "@/components/elements/input"
import AppLayout from "@/components/layouts/app-layout"
import InputError from "@/components/elements/input-error"

export default function UsersCreate() {
  const { success, error } = usePage<SharedData>().props

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    role: "",
    status: "ACTIVE",
  })

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Users",
      href: route("users.index"),
    },
    {
      title: "Create",
      href: route("users.create"),
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    post(route("users.store"), {
      onSuccess: () => {
        toast.success("User created successfully")
        reset("password", "password_confirmation", "role", "email", "username")
      },
      onError: (errors) => {
        console.error(errors)
        toast.error("Failed to create user")
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  useEffect(() => {
    if (success) toast.success(success as string)
    if (error) toast.error(error as string)
  }, [success, error])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="container py-6 px-2">
        <div className="bg-background border rounded-md shadow-sm">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-xl font-semibold">Create New User</h1>
              <p className="text-sm text-muted-foreground mt-1">Add a new user to the system</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-medium">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    value={data.username}
                    onChange={(e) => setData("username", e.target.value)}
                    aria-invalid={errors.username ? "true" : "false"}
                    aria-describedby={errors.username ? "username-error" : undefined}
                    className="max-w-md"
                    required
                  />
                  {errors.username && <InputError id="username-error" message={errors.username} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="max-w-md"
                    required
                  />
                  {errors.email && <InputError id="email-error" message={errors.email} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative max-w-md">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <InputError id="password-error" message={errors.password} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="font-medium">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative max-w-md">
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={data.password_confirmation}
                      onChange={(e) => setData("password_confirmation", e.target.value)}
                      aria-invalid={errors.password_confirmation ? "true" : "false"}
                      aria-describedby={errors.password_confirmation ? "password-confirmation-error" : undefined}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={toggleConfirmPasswordVisibility}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password_confirmation && (
                    <InputError id="password-confirmation-error" message={errors.password_confirmation} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="font-medium">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select value={data.role} onValueChange={(value) => setData("role", value)} name="role" required>
                    <SelectTrigger id="role" aria-invalid={errors.role ? "true" : "false"} className="max-w-md">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="COURIER">Courier</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.role && <InputError id="role-error" message={errors.role} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-medium">
                    Status
                  </Label>
                  <Select value={data.status} onValueChange={(value) => setData("status", value)} name="status">
                    <SelectTrigger id="status" aria-invalid={errors.status ? "true" : "false"} className="max-w-md">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.status && <InputError id="status-error" message={errors.status} />}
                  <p className="text-xs text-muted-foreground">Default status is Active</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Users
              </Button>
              <Button type="submit" disabled={processing || isSubmitting} className="min-w-[120px]">
                {processing || isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
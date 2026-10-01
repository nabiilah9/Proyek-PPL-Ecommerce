import { cn } from "@/lib/utils";

type TrackingCardProps = {
  title: string;
  time: string;
  messages: string[];
  number: number;
  className?: string;
};

export default function TrackingCard({ title, time, messages, number, className }: TrackingCardProps) {
  return (
    <div className={cn("absolute bg-white rounded-2xl p-4 w-96", className)}>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="text-[#51793E] font-bold text-xl">
            <strong>{ title }</strong>
          </h1>
          <p>{ time }</p>
        </div>
        {messages.map(( msg, index ) => (
          <p key={ index } className={index === 0 ? 'font-bold' : ''}>
            { msg }
          </p>
        ))}
        <div className="outline-text absolute right-1 -top-20 text-7xl font-bold">{ number }</div>
      </div>
    </div>
  );
};
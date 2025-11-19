import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  id: string;
  name: string;
  date: Date;
  location: string;
  imageUrl?: string | null;
  price?: number;
}

export function EventCard({ id, name, date, location, imageUrl, price }: EventCardProps) {
  return (
    <Link href={`/events/${id}`} className="group">
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-500/50">
        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-50">
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm">
              {price ? `$${price}` : "Free"}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
            {name}
          </h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
              {format(new Date(date), "MMM d, yyyy • h:mm a")}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
              {location}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

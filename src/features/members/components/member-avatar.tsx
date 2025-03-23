import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// TODO: FB-3025 - This is a boilerplate, should be replaced with Jessica's logic
interface MemberAvatarProps {
    image?: string;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const MemberAvatar = ({
    image,
    name,
    className,
    fallbackClassName,
}: MemberAvatarProps) => {
    if (image) {
        return (
            <div className={cn("size-6 relative rounded-full overflow-hidden", className)}>
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
        );
    }

    return (
        <Avatar className={cn("size-6 rounded-full", className)}>
            <AvatarFallback
                className={cn(
                    "text-white bg-gray-600 font-semibold text-sm uppercase rounded-full",
                    fallbackClassName
                )}
            >
                {name[0]}
            </AvatarFallback>
        </Avatar>
    );
};

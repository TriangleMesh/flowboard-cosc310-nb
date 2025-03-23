import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import React from "react";
  
  import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
  
  interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
  }
//   TODO: implementation of functions for the taskActions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {
    return (
      <div className="flex justify-end">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Task Details */}
            <DropdownMenuItem onClick={() => {}} className="font-medium p-[10px]">
              <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
              Task Details
            </DropdownMenuItem>
  
            {/* Open Project */}
            <DropdownMenuItem onClick={() => {}} className="font-medium p-[10px]">
              <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
              Open Project
            </DropdownMenuItem>
  
            {/* Edit Task */}
            <DropdownMenuItem onClick={() => {}} className="font-medium p-[10px]">
              <PencilIcon className="size-4 mr-2 stroke-2" />
              Edit Task
            </DropdownMenuItem>
  
            {/* Delete Task */}
            <DropdownMenuItem
              onClick={() => {}}
              className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
            >
              <TrashIcon className="size-4 mr-2 stroke-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  
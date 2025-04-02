"use client";

import React, { useMemo } from "react";
import { CardContent } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Task } from "@/features/tasks/types";
import { differenceInDays } from "date-fns";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useParams } from "next/navigation";

interface TaskProgressMetricsProps {
    tasks: Task[];
}

const COLORS = ["#22c55e", "#ef4444"];

const TaskProgressMetrics = ({ tasks }: TaskProgressMetricsProps) => {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    console.log("workspaceId", workspaceId);
    const processedTasks = useMemo(() => {
        return tasks.map((task) => ({
            ...task,
            id: task.$id || task.id,
        }));
    }, [tasks]);


    const today = new Date();


    const overdueTasks = useMemo(() => {
        return processedTasks.filter((task) => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate < today;
        });
    }, [processedTasks, today]);


    const upcomingTasks = useMemo(() => {
        return processedTasks.filter((task) => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate > today;
        });
    }, [processedTasks, today]);


    const upcomingWithinWeek = useMemo(() => {
        return upcomingTasks.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return differenceInDays(dueDate, today) <= 7;
        });
    }, [upcomingTasks, today]);

    const upcomingAfterWeek = useMemo(() => {
        return upcomingTasks.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return differenceInDays(dueDate, today) > 7;
        });
    }, [upcomingTasks, today]);


    const incompleteOverdueTasks = useMemo(() => {
        return overdueTasks.filter((task) => task.status !== "DONE");
    }, [overdueTasks]);

    const incompleteUpcomingWithinWeek = useMemo(() => {
        return upcomingWithinWeek.filter((task) => task.status !== "DONE");
    }, [upcomingWithinWeek]);

    const incompleteUpcomingAfterWeek = useMemo(() => {
        return upcomingAfterWeek.filter((task) => task.status !== "DONE");
    }, [upcomingAfterWeek]);

    const completedOverdue = overdueTasks.filter((task) => task.status === "DONE").length;
    const incompleteOverdue = incompleteOverdueTasks.length;

    const completedUpcomingWithinWeek = upcomingWithinWeek.filter((task) => task.status === "DONE").length;
    const incompleteUpcomingWithinWeekCount = incompleteUpcomingWithinWeek.length;

    const completedUpcomingAfterWeek = upcomingAfterWeek.filter((task) => task.status === "DONE").length;
    const incompleteUpcomingAfterWeekCount = incompleteUpcomingAfterWeek.length;


    const overduePieData = [
        { name: "Completed", value: completedOverdue },
        { name: "Incomplete", value: incompleteOverdue },
    ];

    const upcomingWithinWeekPieData = [
        { name: "Completed", value: completedUpcomingWithinWeek },
        { name: "Incomplete", value: incompleteUpcomingWithinWeekCount },
    ];

    const upcomingAfterWeekPieData = [
        { name: "Completed", value: completedUpcomingAfterWeek },
        { name: "Incomplete", value: incompleteUpcomingAfterWeekCount },
    ];
    const { data: membersData } = useGetMembers({ workspaceId });
    const members = membersData?.documents || [];

    const memberMap = useMemo(() => {
        const map: Record<string, { id: string; name: string }> = {};
        for (const m of members) {
            map[ m.$id] = {
                id: m.$id,
                name: m.name || "Unknown",
            };
        }
        return map;
    }, [members]);

    const memberCompletionStats = useMemo(() => {
        const stats: Record<string, { name: string; total: number; completed: number }> = {};
        for (const task of processedTasks) {
            for (const assigneeId of task.assigneesId || []) {
                if (!memberMap[assigneeId]) continue;
                const member = memberMap[assigneeId];
                if (!stats[assigneeId]) {
                    stats[assigneeId] = { name: member.name, total: 0, completed: 0 };
                }
                stats[assigneeId].total += 1;
                if (task.status === "DONE") stats[assigneeId].completed += 1;
            }
        }
        return stats;
    }, [processedTasks, memberMap]);
    console.log("members", members);
    console.log("processedTasks", processedTasks);
    return (
        <CardContent>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-center mb-2">Overdue Tasks</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={overduePieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {overduePieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-center mb-2">Upcoming (Within Week)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={upcomingWithinWeekPieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {upcomingWithinWeekPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-center mb-2">Upcoming (After Week)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={upcomingAfterWeekPieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {upcomingAfterWeekPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-center">Team Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {Object.entries(memberCompletionStats).map(([id, stat]) => {
                        const percent = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
                        return (
                            <div key={id} className="p-4 border rounded-md">
                                <div className="font-medium">{stat.name}</div>
                                <div className="text-sm text-gray-500">
                                    {stat.completed} / {stat.total} tasks completed ({percent.toFixed(0)}%)
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded mt-1">
                                    <div
                                        className="bg-green-500 h-2 rounded"
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </CardContent>
    )
};

export default TaskProgressMetrics;
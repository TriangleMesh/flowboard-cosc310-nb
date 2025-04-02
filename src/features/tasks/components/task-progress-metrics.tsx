"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

interface TaskProgressMetricsProps {
    tasks: Task[];
}

const COLORS = ["#22c55e", "#ef4444"]; // 完成：绿色，未完成：红色

const TaskProgressMetrics = ({ tasks }: TaskProgressMetricsProps) => {
    // 确保每个任务都有唯一 ID
    const processedTasks = useMemo(() => {
        return tasks.map((task) => ({
            ...task,
            id: task.$id || task.id, // Ensure each task has a unique id
        }));
    }, [tasks]);

    // 获取今天的日期
    const today = new Date();

    // 筛选过期任务
    const overdueTasks = useMemo(() => {
        return processedTasks.filter((task) => {
            if (!task.dueDate) return false; // 如果没有 dueDate，跳过
            const dueDate = new Date(task.dueDate);
            return dueDate < today; // 过期任务（截止日期早于今天）
        });
    }, [processedTasks, today]);

    // 筛选即将到来的任务
    const upcomingTasks = useMemo(() => {
        return processedTasks.filter((task) => {
            if (!task.dueDate) return false; // 如果没有 dueDate，跳过
            const dueDate = new Date(task.dueDate);
            return dueDate > today; // 即将到来的任务（截止日期晚于今天）
        });
    }, [processedTasks, today]);

    // 进一步细分即将到来的任务
    const upcomingWithinWeek = useMemo(() => {
        return upcomingTasks.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return differenceInDays(dueDate, today) <= 7; // 近一周内的任务
        });
    }, [upcomingTasks, today]);

    const upcomingAfterWeek = useMemo(() => {
        return upcomingTasks.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return differenceInDays(dueDate, today) > 7; // 超过一周的任务
        });
    }, [upcomingTasks, today]);

    // 筛选未完成的过期任务
    const incompleteOverdueTasks = useMemo(() => {
        return overdueTasks.filter((task) => task.status !== "DONE");
    }, [overdueTasks]);

    // 筛选未完成的即将到来的任务
    const incompleteUpcomingWithinWeek = useMemo(() => {
        return upcomingWithinWeek.filter((task) => task.status !== "DONE");
    }, [upcomingWithinWeek]);

    const incompleteUpcomingAfterWeek = useMemo(() => {
        return upcomingAfterWeek.filter((task) => task.status !== "DONE");
    }, [upcomingAfterWeek]);

    // 统计完成和未完成的任务数量
    const completedOverdue = overdueTasks.filter((task) => task.status === "DONE").length;
    const incompleteOverdue = incompleteOverdueTasks.length;

    const completedUpcomingWithinWeek = upcomingWithinWeek.filter((task) => task.status === "DONE").length;
    const incompleteUpcomingWithinWeekCount = incompleteUpcomingWithinWeek.length;

    const completedUpcomingAfterWeek = upcomingAfterWeek.filter((task) => task.status === "DONE").length;
    const incompleteUpcomingAfterWeekCount = incompleteUpcomingAfterWeek.length;

    // 准备饼图数据
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
                {/* 饼图 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 过期任务饼图 */}
                    <div>
                        <h3 className="text-lg font-semibold text-center">Overdue Tasks</h3>
                        <ResponsiveContainer width="100%" height={200}>
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

                    {/* 即将到来的任务（近一周内）饼图 */}
                    <div>
                        <h3 className="text-lg font-semibold text-center">Upcoming (Within Week)</h3>
                        <ResponsiveContainer width="100%" height={200}>
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

                    {/* 即将到来的任务（超过一周）饼图 */}
                    <div>
                        <h3 className="text-lg font-semibold text-center">Upcoming (After Week)</h3>
                        <ResponsiveContainer width="100%" height={200}>
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

            </CardContent>
        </Card>
    );
};

export default TaskProgressMetrics;
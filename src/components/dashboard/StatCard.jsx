import { Card } from "@heroui/react";

export default function StatCard({ title, value, icon: Icon }) {
  return (
    <Card className="bg-[#161618] border border-[#27272a] shadow-none rounded-2xl p-5 flex flex-col justify-between gap-6">
      <Card.Header className="p-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[#222226] flex items-center justify-center text-neutral-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </Card.Header>
      <Card.Content className="p-0 flex flex-col gap-1">
        <span className="text-sm font-normal text-neutral-400">{title}</span>
        <span className="text-3xl font-semibold text-white tracking-tight">{value}</span>
      </Card.Content>
    </Card>
  );
}
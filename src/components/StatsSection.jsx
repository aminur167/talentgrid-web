'use client';
import Image from "next/image";
import { Card } from "@heroui/react";
import { motion } from "motion/react"
import {
  Briefcase,
 Factory ,
  Person,
  Star,
} from "@gravity-ui/icons";

function StatsSection() {
  const stats = [
    {
      value: "50K",
      label: "Active Jobs",
      icon: Briefcase,
    },
    {
      value: "12K",
      label: "Companies",
      icon: Factory,
    },
    {
      value: "2M",
      label: "Job Seekers",
      icon: Person,
    },
    {
      value: "97%",
      label: "Satisfaction Rate",
      icon: Star,
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* Globe Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90" style={{ backgroundImage: "url('/images/globe.png')" }}/>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Top Gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/50 to-transparent" />

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black via-black/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 md:pt-36 lg:px-8 lg:pb-24">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-medium leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Assisting over 15,000 job seekers
            <br className="hidden sm:block" />
            find their dream positions.
          </h2>
        </div>

        {/* Statistics */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="group min-h-44 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0c]/90 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#111113]"
              >
                <Card.Content className="flex min-h-44 flex-col justify-between p-5">

                  {/* Icon */}
                  <div>
                    <Icon
                      className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Stats */}
                  <div>
                    <p className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-sm text-gray-300">
                      {stat.label}
                    </p>
                  </div>

                </Card.Content>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
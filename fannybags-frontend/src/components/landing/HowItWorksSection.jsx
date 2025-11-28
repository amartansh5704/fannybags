// src/components/landing/HowItWorks.jsx
import React from "react";
import FlowingMenu from "../reactbits/components/FlowingMenu";

export default function HowItWorks() {
  const items = [
    { text: "HOW", detail: "Artists launch campaigns and upload unreleased tracks." },
    { text: "IT", detail: "Fans invest in partitions and unlock royalty rights." },
    { text: "WORKS", detail: "Royalties are distributed to investors every cycle." },
  ];

  return (
    <section
      id="how-it-works"
      className="h-screen w-full bg-black text-white overflow-hidden"
    >
      <FlowingMenu items={items} fullScreen />
    </section>
  );
}

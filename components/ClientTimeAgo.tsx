"use client";

import { useEffect, useState } from "react";
import ReactTimeago from "react-timeago";

const ClientTimeAgo = ({ date }: { date: Date | string }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Prevents hydration error

  return <ReactTimeago date={typeof date === "string" ? new Date(date) : date} />;
};

export default ClientTimeAgo;

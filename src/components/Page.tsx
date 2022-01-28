import React, { useEffect } from "react";

const Page = (props: { title: string; children: React.ReactNode }) => {
  return <div className="page">{props.children}</div>;
};

export default Page;

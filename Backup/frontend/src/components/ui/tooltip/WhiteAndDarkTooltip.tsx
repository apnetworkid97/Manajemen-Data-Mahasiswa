import React from "react";
import { Tooltip } from "./Tooltip";
import Button from "../button/Button";

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function WhiteAndDarkTooltip() {
  return (
    <div className="flex items-center gap-10">
      {/* <!-- White --> */}
      <Tooltip content="This is a top tooltip" position="top">
        <Button size="sm">Tooltip Top</Button>
      </Tooltip>
      {/* <!-- Dark --> */}
      <Tooltip content="This is a top tooltip" position="top" theme="dark">
        <Button size="sm">Tooltip Top</Button>
      </Tooltip>
    </div>
  );
}

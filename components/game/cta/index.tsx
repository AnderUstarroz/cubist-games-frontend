import dynamic from "next/dynamic";
import { CTAPropsType } from "./types";

const MyBets = dynamic(() => import("../my-bets"));

export default function CTA({ template, myBets }: CTAPropsType) {
  return (
    <div>
      <MyBets template={template} myBets={myBets} />
    </div>
  );
}

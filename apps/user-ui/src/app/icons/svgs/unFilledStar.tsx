
import * as React from "react";
import { SVGProps } from "react";
const UnFilledStar = (props: SVGProps<SVGSVGElement>) => (
    <svg
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="22"   // small default size (can override via props)
        height="22"
        viewBox="0 0 64 64"
        enableBackground="new 0 0 64 64"
        xmlSpace="preserve"
        {...props}
    >
        <polygon
            fill="none"
            stroke="#000000"
            strokeWidth={2}
            strokeMiterlimit={10}
            points="32,47 12,62 20,38 2,24 24,24 32,1 40,24  62,24 44,38 52,62 "
        />
    </svg>
);
export default UnFilledStar;
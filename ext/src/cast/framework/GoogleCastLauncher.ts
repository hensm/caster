"use strict";

import logger from "../../lib/logger";


/**
 * Custom element for a cast button used by sites that injects
 * a cast icon and manages visibility state and event handling.
 */
export default class GoogleCastLauncher extends HTMLElement {
    constructor() {
        super();

        this.style.display = "none";

        const style = document.createElement("style");
        style.textContent = `
            .cast_caf_state_c {
                fill: var(--connected-color, #4285f4);
            }
            .cast_caf_state_d {
                fill: var(--disconnected-color, #7d7d7d);
            }
            .cast_caf_state_h {
                opacity: 0;
            }
        `;

        const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

        const icon = document.createElementNS(SVG_NAMESPACE, "svg");
        const iconArch0 = document.createElementNS(SVG_NAMESPACE, "path");
        const iconArch1 = document.createElementNS(SVG_NAMESPACE, "path");
        const iconArch2 = document.createElementNS(SVG_NAMESPACE, "path");
        const iconBox = document.createElementNS(SVG_NAMESPACE, "path");
        const iconBoxFill = document.createElementNS(SVG_NAMESPACE, "path");

        // Set SVG attributes
        icon.setAttribute("x", "0");
        icon.setAttribute("y", "0");
        icon.setAttribute("width", "100%");
        icon.setAttribute("height", "100%");
        icon.setAttribute("viewBox", "0 0 24 24");

        iconArch0.classList.add("cast_caf_state_d");
        iconArch0.setAttribute("id", "cast_caf_icon_arch0");
        iconArch0.setAttribute("d", "M1 18v3h3c0-1.7-1.34-3-3-3z");

        iconArch1.classList.add("cast_caf_state_d");
        iconArch1.setAttribute("id", "cast_caf_icon_arch1");
        iconArch1.setAttribute("d", "M1 14v2c2.76 0 5 2.2 5 5h2c0-3.87-3.13-7-7-7z");

        iconArch2.classList.add("cast_caf_state_d");
        iconArch2.setAttribute("id", "cast_caf_icon_arch2");
        iconArch2.setAttribute("d", "M1 10v2c4.97 0 9 4 9 9h2c0-6.08-4.93-11-11-11z");

        iconBox.classList.add("cast_caf_state_d");
        iconBox.setAttribute("id", "cast_caf_icon_box");
        iconBox.setAttribute("d", "M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z");

        iconBoxFill.classList.add("cast_caf_state_h");
        iconBoxFill.setAttribute("id", "cast_caf_icon_boxfill");
        iconBoxFill.setAttribute("d", "M5 7v1.63C8 8.6 13.37 14 13.37 17H19V7z");

        // Add icon paths to SVG
        icon.append(iconArch0, iconArch1, iconArch2, iconBox, iconBoxFill);

        const shadow = this.attachShadow({ mode: "open" });
        shadow.append(icon, style);


        this.addEventListener("click", () => {
            logger.info("<google-cast-launcher> onClick");
        });
    }
}

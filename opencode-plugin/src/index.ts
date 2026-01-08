/**
 * Bottle - Cloud Atlas AI Core Stack for OpenCode
 *
 * Meta-plugin bundling ba, wm, and superego in one npm package.
 */

import type { Plugin } from "@opencode-ai/plugin";
import { BA } from "ba-opencode";
import { WM } from "wm-opencode";
import { Superego } from "superego-opencode";

export const Bottle: Plugin[] = [BA, WM, Superego];
export { BA, WM, Superego };
export default Bottle;

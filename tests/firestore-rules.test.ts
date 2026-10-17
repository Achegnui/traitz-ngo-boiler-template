import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A STATIC check of firestore.rules, not a run of them: the rules emulator needs Java and a download that is not
 * available here, so the real allow/deny behaviour is checked by hand (DONATIONS-TEST.md, section "Rules playground").
 * This only guards the shape that keeps donations server-only, so an edit cannot loosen it unnoticed.
 */
const rules = readFileSync("firestore.rules", "utf8");

/** The text between the braces of the first `match <path> {` block, found by counting braces. */
function block(header: string): string {
  const start = rules.indexOf(header);
  if (start < 0) throw new Error(`no block: ${header}`);
  const open = rules.indexOf("{", start + header.length); // the block's own brace, after the {wildcard} in the path
  let depth = 0;
  for (let i = open; i < rules.length; i++) {
    if (rules[i] === "{") depth++;
    if (rules[i] === "}" && --depth === 0) return rules.slice(open + 1, i);
  }
  throw new Error("unbalanced braces");
}
const allowLines = (text: string) => text.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("allow"));
const strip = (t: string) => t.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");

describe("firestore.rules", () => {
  it("uses rules version 2 and balanced braces", () => {
    expect(rules).toContain("rules_version = '2';");
    expect([...rules].filter((c) => c === "{").length).toBe([...rules].filter((c) => c === "}").length);
  });

  describe("donations", () => {
    const donations = strip(block("match /donations/{id}"));
    it("can be read by editors only and never written by a client", () => {
      expect(allowLines(donations)).toEqual(["allow read: if isEditor();", "allow write: if false;"]);
    });
    it("is not reachable through the generic content rule or the form submissions rule", () => {
      expect(rules).toMatch(/function isContent\(c\) \{ return c in \[[^\]]*\]; \}/);
      const list = /function isContent\(c\) \{ return c in \[([^\]]*)\]/.exec(rules)![1];
      expect(list).not.toMatch(/donations|submissions|admins|settings/);
    });
    it("is the only block that mentions donations in an allow rule", () => {
      const outside = strip(rules.replace(block("match /donations/{id}"), ""));
      expect(allowLines(outside).join("\n")).not.toMatch(/donations/);
    });
  });

  it("isEditor means administrator or editor, so contributors cannot read donations", () => {
    expect(rules).toMatch(/function isEditor\(\) \{ return isStaff\(\) && staffDoc\(\)\.role in \['administrator', 'editor'\]; \}/);
  });

  it("grants public access nowhere except reading settings and creating a form submission", () => {
    const open = strip(rules).split("\n").map((l) => l.trim()).filter((l) => /if true/.test(l));
    expect(open).toEqual(["allow read: if true;"]);
    expect(strip(block("match /settings/{id}"))).toContain("allow read: if true;");
    const subs = strip(block("match /submissions/{id}"));
    expect(subs).toContain("allow create: if request.resource.data.keys().hasOnly(");
    expect(subs).toContain("allow read, update, delete: if isEditor();");
  });

  it("keeps staff records for administrators", () => {
    expect(strip(block("match /admins/{uid}"))).toContain("allow create, update, delete: if isAdministrator();");
  });
});

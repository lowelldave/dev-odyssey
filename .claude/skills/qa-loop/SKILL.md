---
name: qa-loop
description: Test and fix loop for Dev Odyssey. Runs the tester agent against a feature or plan, sends every bug it finds to the coder agent to fix, and re-tests until everything passes. Use it after implementing a feature, or when the user asks to test, QA or verify the app.
---

# QA loop: tester ⇄ coder

Subagents can't call each other, so you (the main session) run the loop. Use the **tester** and **coder** agents defined in `.claude/agents/`.

1. **Scope.**
   - Collect what's being tested: the planner's plan (or the feature description) and the coder's change report.
   - If there is no plan, ask the tester for a full regression pass of the app.
2. **Test.** Start the `tester` agent with the plan and the change report, and ask for its report in the standard format.
3. **If the verdict is ALL PASS:** stop. Summarise the coverage for the user, and say what wasn't tested.
4. **If there are failures:**
   - Start (or, on later rounds, `SendMessage` to) the `coder` agent.
   - Pass on the tester's bug reports **verbatim**: steps to reproduce, expected versus actual, suspected cause and acceptance check.
   - Ask the coder to fix every bug, then report what changed and how it verified the fix.
5. **Re-test.**
   - Send the coder's fix report to the tester (`SendMessage` to the same tester, so it keeps its context).
   - Ask it to re-run the failed acceptance checks plus a regression pass of the related flows.
   - Go back to step 3.
6. **Guard rails.**
   - Keep a round counter. After **5 rounds**, or if the same bug fails twice after "fixes", stop the loop. Report the stuck bugs, both agents' latest findings, and a recommendation, then ask the user how to proceed.
   - If a fix needs a product decision (behaviour the plan doesn't define), pause and ask the user. Don't let the coder guess.
   - Don't commit or push as part of the loop unless the user asked for it.

When you finish, report:
- the number of rounds
- the bugs found and fixed, with their severity
- the final coverage
- anything left untested or open

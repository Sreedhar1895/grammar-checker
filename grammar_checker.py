#!/usr/bin/env python3
"""
Terminal grammar checker. Uses Claude to evaluate text and return
a grammatically corrected version. Accept, reject, or fine-tune results.
"""

import sys
from llm_checker import correct_text


def get_input_text() -> str:
    """Read text from stdin or prompt user."""
    if not sys.stdin.isatty():
        return sys.stdin.read()

    print("Enter or paste text to check. Press Enter twice (or Ctrl+D) when done:\n")
    lines = []
    empty_count = 0
    while True:
        try:
            line = input()
            if line == "":
                empty_count += 1
                if empty_count >= 1:
                    break
            else:
                empty_count = 0
            lines.append(line)
        except EOFError:
            break
    return "\n".join(lines) if lines else ""


def main() -> None:
    print("Grammar Checker (Claude)")
    print("-" * 40)

    text = get_input_text()
    if not text.strip():
        print("No text provided.")
        sys.exit(1)

    interactive = sys.stdin.isatty()

    try:
        result = correct_text(text)
    except RuntimeError as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)

    if not interactive:
        print("\n" + "-" * 40)
        print("Corrected text:")
        print(result)
        return

    # Interactive: accept, reject, or fine-tune
    while True:
        if result != text:
            print("\nApplied corrections.")
        else:
            print("\n✓ No issues found.")

        print("\n" + "-" * 40)
        print("Corrected text:")
        print(result)
        print("\n" + "-" * 40)
        print("(a)ccept  (r)eject  (f)ine-tune with more input")
        choice = input("Choice: ").strip().lower()

        if choice == "a":
            break
        if choice == "r":
            result = text
            print("\nRejected. Keeping original.")
            break
        if choice == "f":
            feedback = input("Additional feedback (e.g. 'make it more formal', 'I meant X'): ").strip()
            if not feedback:
                print("No feedback entered. Try again.")
                continue
            try:
                result = correct_text(text, user_feedback=feedback, previous_correction=result)
            except RuntimeError as e:
                print(f"\nError: {e}", file=sys.stderr)
                continue
        else:
            print("Invalid choice. Use a, r, or f.")

    print("\n" + "-" * 40)
    print("Final text:")
    print(result)


if __name__ == "__main__":
    main()

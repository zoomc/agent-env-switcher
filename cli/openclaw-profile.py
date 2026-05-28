#!/usr/bin/env python3
"""
OpenClaw Profile Manager CLI

Manages OpenClaw AI coding assistant profiles.
Works with the same profile storage as the Agent Env Switcher GUI.

Commands:
  list              List all OpenClaw profiles
  show <id>         Show profile details (key masked)
  switch <id>       Set active profile
  add               Add a new profile (interactive)
  update <id>       Update an existing profile
  delete <id>       Delete a profile
  apply <id>        Apply profile to ~/.openclaw/settings.json

Security: API keys are NEVER printed to stdout/stderr.
"""

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

STORAGE_DIR = Path.home() / ".config" / "agent-env-switcher"
PROFILES_FILE = STORAGE_DIR / "openclaw-profiles.json"
CONFIG_PATH = Path.home() / ".openclaw" / "settings.json"

MASK_PREFIX_LEN = 5
MASK_SUFFIX_LEN = 3
MASK_CHAR = "*"


def mask_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= MASK_PREFIX_LEN + MASK_SUFFIX_LEN:
        return MASK_CHAR * len(key)
    prefix = key[:MASK_PREFIX_LEN]
    suffix = key[-MASK_SUFFIX_LEN:]
    middle_len = len(key) - MASK_PREFIX_LEN - MASK_SUFFIX_LEN
    middle = MASK_CHAR * min(middle_len, 12)
    return f"{prefix}{middle}{suffix}"


def load_profiles() -> list[dict]:
    if not PROFILES_FILE.exists():
        return []
    try:
        with open(PROFILES_FILE) as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
    except (json.JSONDecodeError, OSError):
        pass
    return []


def save_profiles(profiles: list[dict]) -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    with open(PROFILES_FILE, "w") as f:
        json.dump(profiles, f, indent=2)


def find_profile(profiles: list[dict], profile_id: str) -> dict | None:
    for p in profiles:
        if p.get("id") == profile_id:
            return p
    return None


def cmd_list():
    profiles = load_profiles()
    if not profiles:
        print("No OpenClaw profiles found.")
        print("Use 'openclaw-profile.py add' to create one.")
        return

    print(f"{'ID':<20} {'Name':<25} {'Provider':<15} {'Active':<8} {'Model'}")
    print("-" * 90)
    for p in profiles:
        active = "YES" if p.get("isActive") else ""
        print(
            f"{p['id']:<20} {p['name']:<25} {p['providerType']:<15} {active:<8} {p['defaultModel']}"
        )
    print(f"\nTotal: {len(profiles)} profile(s)")


def cmd_show(profile_id: str):
    profiles = load_profiles()
    profile = find_profile(profiles, profile_id)
    if not profile:
        print(f"Error: Profile '{profile_id}' not found.", file=sys.stderr)
        sys.exit(1)

    print(f"ID:             {profile['id']}")
    print(f"Name:           {profile['name']}")
    print(f"Provider:       {profile['providerType']}")
    print(f"Base URL:       {profile['baseUrl']}")
    print(f"Default Model:  {profile['defaultModel']}")
    print(f"Fast Model:     {profile['fastModel']}")
    print(f"Reasoning:      {profile['reasoningModel']}")
    print(f"API Key:        {mask_key(profile.get('apiKey', ''))}")
    print(f"Active:         {'Yes' if profile.get('isActive') else 'No'}")
    print(f"Last Applied:   {profile.get('lastApplied', 'Never')}")


def cmd_switch(profile_id: str):
    profiles = load_profiles()
    profile = find_profile(profiles, profile_id)
    if not profile:
        print(f"Error: Profile '{profile_id}' not found.", file=sys.stderr)
        sys.exit(1)

    for p in profiles:
        p["isActive"] = p["id"] == profile_id

    save_profiles(profiles)
    print(f"Switched to profile: {profile['name']}")


def cmd_add():
    profile_id = f"openclaw-{int(time.time() * 1000)}"
    name = input("Profile name: ").strip()
    if not name:
        print("Error: Name is required.", file=sys.stderr)
        sys.exit(1)

    provider = input("Provider type [openai-compatible]: ").strip() or "openai-compatible"
    base_url = input("Base URL [https://api.example.com/v1]: ").strip() or "https://api.example.com/v1"
    default_model = input("Default model [gpt-4o]: ").strip() or "gpt-4o"
    fast_model = input("Fast model [gpt-4o-mini]: ").strip() or "gpt-4o-mini"
    reasoning_model = input("Reasoning model [o1]: ").strip() or "o1"
    api_key = input("API key: ").strip()

    profiles = load_profiles()
    new_profile = {
        "id": profile_id,
        "targetType": "openclaw",
        "name": name,
        "providerType": provider,
        "baseUrl": base_url,
        "defaultModel": default_model,
        "fastModel": fast_model,
        "reasoningModel": reasoning_model,
        "apiKey": api_key,
        "isActive": False,
        "lastApplied": None,
        "healthStatus": "unknown",
    }
    profiles.append(new_profile)
    save_profiles(profiles)
    print(f"Created profile: {name} ({profile_id})")


def cmd_update(profile_id: str):
    profiles = load_profiles()
    profile = find_profile(profiles, profile_id)
    if not profile:
        print(f"Error: Profile '{profile_id}' not found.", file=sys.stderr)
        sys.exit(1)

    print(f"Updating profile: {profile['name']}")
    print("Press Enter to keep current value.\n")

    name = input(f"Name [{profile['name']}]: ").strip()
    if name:
        profile["name"] = name

    provider = input(f"Provider [{profile['providerType']}]: ").strip()
    if provider:
        profile["providerType"] = provider

    base_url = input(f"Base URL [{profile['baseUrl']}]: ").strip()
    if base_url:
        profile["baseUrl"] = base_url

    default_model = input(f"Default Model [{profile['defaultModel']}]: ").strip()
    if default_model:
        profile["defaultModel"] = default_model

    fast_model = input(f"Fast Model [{profile['fastModel']}]: ").strip()
    if fast_model:
        profile["fastModel"] = fast_model

    reasoning_model = input(f"Reasoning Model [{profile['reasoningModel']}]: ").strip()
    if reasoning_model:
        profile["reasoningModel"] = reasoning_model

    api_key = input("API key (leave empty to keep current): ").strip()
    if api_key:
        profile["apiKey"] = api_key

    save_profiles(profiles)
    print(f"Updated profile: {profile['name']}")


def cmd_delete(profile_id: str):
    profiles = load_profiles()
    profile = find_profile(profiles, profile_id)
    if not profile:
        print(f"Error: Profile '{profile_id}' not found.", file=sys.stderr)
        sys.exit(1)

    confirm = input(f"Delete profile '{profile['name']}'? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Cancelled.")
        return

    profiles = [p for p in profiles if p["id"] != profile_id]
    save_profiles(profiles)
    print(f"Deleted profile: {profile['name']}")


def cmd_apply(profile_id: str):
    profiles = load_profiles()
    profile = find_profile(profiles, profile_id)
    if not profile:
        print(f"Error: Profile '{profile_id}' not found.", file=sys.stderr)
        sys.exit(1)

    config = {
        "provider": profile["providerType"],
        "baseUrl": profile["baseUrl"],
        "apiKey": profile["apiKey"],
        "model": profile["defaultModel"],
        "fastModel": profile["fastModel"],
        "reasoningModel": profile["reasoningModel"],
    }

    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)

    if CONFIG_PATH.exists():
        backup_path = CONFIG_PATH.with_suffix(f".json.bak.{int(time.time())}")
        CONFIG_PATH.rename(backup_path)
        print(f"Backup created: {backup_path}")

    CONFIG_PATH.write_text(json.dumps(config, indent=2))

    profile["lastApplied"] = datetime.now().isoformat()
    save_profiles(profiles)

    print(f"Applied profile '{profile['name']}' to {CONFIG_PATH}")
    print(f"Config path: {CONFIG_PATH}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    command = sys.argv[1]

    if command == "list":
        cmd_list()
    elif command == "show":
        if len(sys.argv) < 3:
            print("Usage: openclaw-profile.py show <profile-id>", file=sys.stderr)
            sys.exit(1)
        cmd_show(sys.argv[2])
    elif command == "switch":
        if len(sys.argv) < 3:
            print("Usage: openclaw-profile.py switch <profile-id>", file=sys.stderr)
            sys.exit(1)
        cmd_switch(sys.argv[2])
    elif command == "add":
        cmd_add()
    elif command == "update":
        if len(sys.argv) < 3:
            print("Usage: openclaw-profile.py update <profile-id>", file=sys.stderr)
            sys.exit(1)
        cmd_update(sys.argv[2])
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Usage: openclaw-profile.py delete <profile-id>", file=sys.stderr)
            sys.exit(1)
        cmd_delete(sys.argv[2])
    elif command == "apply":
        if len(sys.argv) < 3:
            print("Usage: openclaw-profile.py apply <profile-id>", file=sys.stderr)
            sys.exit(1)
        cmd_apply(sys.argv[2])
    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()

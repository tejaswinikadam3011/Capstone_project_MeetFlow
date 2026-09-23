## MeetFlow

Product Requirements Document (PRD)

Version 1.0 | AI-Powered Meeting Platform for Colleges

## 1. Document Purpose

This Product Requirements Document (PRD) defines what MeetFlow must do from a product and user perspective. It describes the problem, the users, the goals, and every functional requirement the product must satisfy. It intentionally avoids implementation detail (covered in the companion TRD) and visual design (to be defined separately).

## 2. Problem Statement

Meetings and classes — run by faculty, teams, or student groups — suffer from recurring problems: people miss sessions and struggle to catch up, action items get forgotten, hosts struggle to manage participation at scale, and there is no easy way to search back through what was discussed weeks ago. In a college, this is worse: many branches and classes can run separate simultaneous meetings, making it easy to lose track of which meeting is which, and no one can reasonably be expected to remember a room code for a meeting they weren't part of.

## 3. Goals & Objectives

- Provide a complete live meeting experience (comparable to Zoom/Teams) tailored for college use.

- Automate recording, summarization, reminders, task extraction, and Q&A; via AI agents.

- Keep a human host in the loop: AI-generated summaries and answers are reviewed/approved, not auto-published.

- Support many simultaneous meetings/classes without confusing participants about which is which.

- Let absentees reliably catch up via approved summaries, highlight reels, and an AI Q&A; assistant.

- Never require a person to memorize a room code for a meeting they can already prove they were part of.

- Let one person act as a participant in some contexts and a host in others, on the same account.

## 4. Target Users / Personas

## Faculty / Host

Runs classes or meetings, needs to manage large groups, assign and track work, and trust that AI-generated summaries are accurate before students see them.

## Student / Participant


Attends classes/meetings, needs a reliable way to catch up if they miss one, complete and report on assigned tasks, and ask questions about what was covered.

## Absentee

A participant who missed a specific session and needs a fast, low-friction way to get caught up without digging through chats or asking classmates.

## One Person, Multiple Roles

The same individual can be a participant in one context (a student in a class) and a host in another (running their own club/group meeting) — role is determined per-meeting.

## 5. Functional Requirements

## 5.1 Onboarding & Account

- FR-1: User can sign up/sign in via Google OAuth or email.

- FR-2: During Google sign-up, system collects birth year and an age-range confirmation (Below 18 / Above 18).

- FR-3: User selects a language preference during onboarding (English, French, and other regional languages).

## 5.2 Home Screen & Navigation

- FR-4: Home screen presents two primary actions: Join and Host.

- FR-5: A Dashboard Calendar on the home screen shows only upcoming/future meetings, with Join/Host actions directly on it, plus an On-the-Spot Meet option.

- FR-6: A Global AI Chat Box is available on the home screen for asking about any past meeting the user attended.

- FR-7: A three-line menu provides access to: Archive (with its own Archive Calendar for past meetings only), Meeting Summary lookup, Plans & Pricing, and About.

## 5.3 Scheduling & Calendars

- FR-8: Host can create an instant room or schedule a future meeting; scheduling auto-generates a room code.

- FR-9: Reminder Agent notifies a user before a meeting only if that user has explicitly added the meeting to their own calendar.

- FR-10: Participants can add a host-scheduled meeting to their own calendar using its room code, enabling reminders and one-click join.

- FR-11: Host can reschedule a meeting to a new date/time from a menu; the room code is preserved, and all participants who added that code see their calendar update automatically.

- FR-12: Host can cancel a scheduled meeting; invited participants are notified automatically.

- FR-13: Recurring meetings can be marked so the host does not need to recreate the room each session.

- FR-14: Faculty can mark their availability status (Available / Busy / Do Not Disturb); when scheduling, the system suggests the best overlapping time and how many faculty are free at that time.


## 5.4 Room Creation & Access

- FR-15: Each meeting is a Room with a unique room code and shareable link, with an optional separate Meeting Password.

- FR-16: Host configures: Meeting Password on/off, Enable Waiting Room, Allow Join Before Host, Automatically Record Meeting, default audio option, and Join Mode (Auto-Admit vs. Manual Approval).

- FR-17: Host can invite participants via native share options (WhatsApp, Instagram, Facebook, Snapchat, Gmail, SMS, Messenger, Truecaller) or Copy to Clipboard.

- FR-18: Multiple rooms can run concurrently, each with a distinct code; one host cannot see another host's meeting data.

## 5.5 Joining a Meeting

- FR-19: Participant can join by pasting a link or entering a room code (plus password/Meeting ID if enabled).

- FR-20: Participant can pre-toggle "Don't Connect to Audio" and "Turn Off My Video" before joining.

- FR-21: Every user, including the host, is explicitly prompted to allow microphone and camera access before joining.

- FR-22: If Waiting Room is enabled, the participant waits until admitted; the host is notified and can Admit individually or in bulk via See Waiting Room.

## 5.6 Live Meeting Experience

- FR-23: All participants (host, co-host, participants) can Mute/Unmute, Start/Stop Video, and Share Screen (with Stop Sharing) — visible to everyone.

- FR-24: Users can Pin a participant so everyone sees them large; if no one is pinned, the view follows the active speaker automatically.

- FR-25: Host can lock mute for everyone (no self-unmute) or allow free/open mode.

- FR-26: Hand Raise Queue lets participants request to speak; host approves unmutes individually or in bulk, with auto-lower-hand after speaking/unmuting.

- FR-27: Host can promote a participant to co-host or full host, remove a participant, or hold a participant in the waiting room indefinitely.

- FR-28: Leave (participant) / End (host, with End-for-all vs. Leave) is available at all times.

- FR-29: In-meeting Chat Box supports Open or Read-only mode, polls/votes, photo/gallery/contact/document attachments, and lets participants change their display name and photo for that meeting.

- FR-30: The chat log (including polls and files) is auto-saved and sent privately to the host after the meeting.

## 5.7 Recording & Privacy

- FR-31: Recording requires explicit permission (host-triggered or auto-record per Room Settings); all participants see a recording notice with the option to continue or leave.

## 5.8 Task Management

- FR-32: Host can assign a task live, during the meeting, to a specific participant or to all via Select All, with a due date and time.

- FR-33: Task Agent auto-detects action items from conversation and creates tasks with due dates automatically.

- FR-34: Assignees update progress as a percentage (e.g. 30%, 50%) or mark a task Done, optionally attaching a document.


- FR-35: Host sees live progress updates and, on the due date, a completion count (done vs. pending).

- FR-36: If a task is overdue and not marked done, the host receives an automatic reminder notification.

- FR-37: Task dashboards are organized per class/group when a host runs separate meetings for different classes.

## 5.9 Post-Meeting Summary Workflow

- FR-38: Summarizer Agent generates a draft summary sent only to the host, marked Pending Review.

- FR-39: Host can edit, approve, or regenerate the summary before publishing, and chooses visibility (Absentees only / Everyone).

- FR-40: Present participants see the recording, summary, and highlight reel automatically in their Archive — no lookup needed.

- FR-41: An absent participant can access the summary/Archive entry for a specific missed meeting by entering its room code the first time only; it then remains in their Archive without needing the code again.

- FR-42: Version history shows the host what the AI originally wrote versus their edits.

- FR-43: The approved summary can be exported as a PDF/document.

## 5.10 AI Q&A; Assistant

- FR-44: A user can ask a natural-language question about a meeting they attended, selecting the specific meeting from their own meeting list (not a memorized code) when multiple meetings could match.

- FR-45: Answers include a jump-to-timestamp link into the recording, a confidence/source indicator (speaker + timestamp), and support conversational follow-up questions.

- FR-46: Q&A; supports multi-meeting search ("have we discussed this before?") and is fully private per individual.

- FR-47: If the AI is not confident, it escalates to the host: the user selects which host (from hosts whose meetings they've attended) to forward the question to; the host's manual answer is saved for future automatic reuse.

- FR-48: Host has a Doubt Log dashboard of commonly asked/unclear questions across their meetings.

## 5.11 Archive

- FR-49: Archive Calendar shows past meetings only, split into Join and Host tabs.

- FR-50: Each Archive entry shows the meeting's Title, Recording, Summary, and Highlight Reel together.

- FR-51: Archive supports search by topic/title name in addition to browsing by date.

## 5.12 Additional Product Features

- FR-52: Reactions bar for non-verbal responses during a meeting.

- FR-53: Role-based permissions (e.g. faculty sees everything; a student sees only their own tasks).

- FR-54: Domain-restricted rooms (e.g. college email domain only, unless a guest is explicitly invited).

- FR-55: End-to-end encryption toggle for sensitive meetings.

- FR-56: Session timeout / auto-logout on shared devices.

- FR-57: Do Not Disturb sync — app silences phone notifications while a meeting is active.

- FR-58: Light/Dark theme toggle, selectable for user comfort.

- FR-59: Low-bandwidth mode that automatically switches to audio-only on a poor connection.

- FR-60: Live translation/captions and background noise filtering during meetings.


## 6. Non-Functional Requirements

- NFR-1: The system must support many simultaneous meetings/rooms without cross-talk or data leakage between hosts.

- NFR-2: AI-generated content (summaries, Q&A; answers) must never be shown to anyone but the host before explicit approval.

- NFR-3: Access to recordings/summaries must respect attendance: present participants get automatic access; absentees require one-time verification via room code.

- NFR-4: The platform must remain usable on low-bandwidth connections (audio-only fallback).

- NFR-5: Reasonable response latency for live audio/video (real-time meeting experience) and for AI Q&A; answers (near-interactive, not blocking).

- NFR-6: Data isolation — one host must never be able to access another host's meeting content.

- NFR-7: Accessibility — theme choice (light/dark), captions, and translation support.

## 7. Out of Scope (for this version)

- Paid subscription billing/payment processing (Plans & Pricing UI exists as a placeholder only).

- Visual design, branding, and detailed UI layout — covered separately.

- Third-party productivity integrations (e.g. Slack/Notion push) — not committed for this version.

## 8. Success Metrics (Suggested)

- Percentage of absentees who successfully catch up via summary/highlight reel without contacting the host directly.

- Reduction in host time spent manually writing meeting minutes (summary approval vs. writing from scratch).

- Task completion rate before due date, and reduction in overdue tasks over time.

- Q&A; Agent's answer confidence rate vs. escalation-to-host rate over time (should improve as the Doubt Log feeds back in).

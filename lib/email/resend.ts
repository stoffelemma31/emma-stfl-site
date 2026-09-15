import { Resend } from "resend";

let client: Resend | null = null;

/** Lazily instantiated so a missing env var only fails a request, never the build. */
export function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set.");
  }
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export function getFromAddress(): string {
  return process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
}

export function getToAddress(): string {
  return process.env.CONTACT_TO_EMAIL ?? "";
}

// app/contact/actions.ts
"use server";

import { getWixClient } from "../lib/wix";

// IMPORTANT:
// This must be the *Collection ID* (not just the display name) of your Wix CMS collection.
// If your collection is named "Contacts" in the UI, the ID is often "Contacts" or "contacts".
const CONTACTS_COLLECTION_ID = "Contacts";

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  const wix = getWixClient();

  // A) Save a submission record into Wix CMS (Data Items)
  let submissionId: string | undefined;
  try {
    const inserted = await wix.items.insert(CONTACTS_COLLECTION_ID, {
      name,
      email,
      phone: phone || null,
      message,
      createdAt: new Date().toISOString(),
      source: "Website contact form",
    });

    submissionId = inserted?._id;
  } catch (err: any) {
    console.error("[contact] CMS insert failed:", err);
    return {
      success: false,
      error: "Failed to save your message. Please try again later.",
    };
  }

  // B) Upsert Wix CRM contact (best effort)
  try {
    // Try find existing contact by email
    const found = await wix.contacts
      .queryContacts()
      .eq("primaryInfo.email", email)
      .find();

    const existing = found?.items?.[0];

    if (existing?._id) {
      await wix.contacts.updateContact(
        existing._id,
        {
          name: { first: name },
          // Keep the email/phone up to date as well
          emails: { items: [{ email, tag: "MAIN" }] },
          ...(phone ? { phones: { items: [{ phone, tag: "MOBILE" }] } } : {}),
        },
        existing.revision || 0
      );
    } else {
      await wix.contacts.createContact({
        name: { first: name },
        emails: { items: [{ email, tag: "MAIN" }] },
        ...(phone ? { phones: { items: [{ phone, tag: "MOBILE" }] } } : {}),
      });
    }
  } catch (err) {
    // Do not fail the submission if CRM upsert fails.
    console.error("[contact] CRM upsert failed:", err);
  }

  console.log("[contact] saved", { submissionId, email });
  return { success: true, submissionId };
}

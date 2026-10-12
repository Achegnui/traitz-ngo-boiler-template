import Link from "next/link";
import { PageTitle } from "@/components/admin/ui";

export default function Help() {
  return (
    <>
      <PageTitle title="Guide: publish a news post" />
      <article className="prose-sm max-w-2xl space-y-6 rounded-lg bg-white p-6 text-[15px] leading-relaxed text-slate-800 shadow-sm ring-1 ring-slate-200">
        <section>
          <h2 className="text-lg font-bold">1. Sign in</h2>
          <p>Go to your website address followed by <strong>/admin</strong>. Type your email and password and press <strong>Sign in</strong>. Forgotten your password? Type your email, then press <strong>Forgot password?</strong></p>
        </section>
        <section>
          <h2 className="text-lg font-bold">2. Start a news post</h2>
          <p>Press <strong>Write a news post</strong> on the Dashboard (or open <strong>News</strong> and press <strong>New news post</strong>).</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">3. Fill it in</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Each text box has an <strong>English</strong> side and a <strong>Français</strong> side. English is required. If you leave French empty, visitors reading in French see the English.</li>
            <li><strong>Title</strong>, <strong>Category</strong>, <strong>Short summary</strong> (one or two sentences, shown on cards and in Google) and the <strong>Article text</strong>. Leave a blank line between paragraphs.</li>
            <li><strong>Cover photo</strong>: press <strong>Upload image</strong> and pick a photo. Describe it in a few words (for people who cannot see it). Tick the permission box only if you really have permission to publish the photo.</li>
            <li>The page address fills itself in from the title. Leave it unless you need to change it.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold">4. Publish</h2>
          <p>Press <strong>Publish</strong>. If something is missing, a red box lists what to fix. Click an item to jump to it. The post is live straight away; press <strong>View it</strong> to see it.</p>
          <p>Not ready? Press <strong>Save draft</strong>. Drafts are never shown on the website. Contributors can only save drafts: an editor reviews and publishes them.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">5. Change or remove it later</h2>
          <p>Open <strong>News</strong>, press <strong>Edit</strong>, make your change and press <strong>Save changes</strong>. <strong>Unpublish</strong> takes it off the website without deleting it. <strong>Delete</strong> removes it for good.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold">Good to know</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>The home page and other pages are built from <strong>sections</strong> (<Link href="/admin/pages" className="underline">Pages</Link>). Open a section to edit it, use Up and Down to reorder, and <strong>Add a section</strong> at the bottom.</li>
            <li>Photos: JPG, PNG, WebP or GIF up to 10 MB. Reports: PDF up to 20 MB.</li>
            <li>If you leave a page with unsaved changes, your browser warns you first.</li>
            <li>Stuck? Ask an administrator. They can add people and change roles under <strong>Users</strong>.</li>
          </ul>
        </section>
      </article>
    </>
  );
}

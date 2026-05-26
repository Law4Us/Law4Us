import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { lawyerVideos } from "@/lib/data/videos";

export const metadata: Metadata = {
  title: "סרטונים משפטיים | Law4Us",
  description: "סרטונים והסברים של עורך הדין על הליכי משפחה וגירושין.",
};

export default function VideosPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-16">
      <header className="mb-12 text-center">
        <p className="mb-3 text-body-small font-semibold text-primary">מידע ברור בגובה העיניים</p>
        <h1 className="mb-4 text-h1 font-bold">סרטונים עם עורך הדין</h1>
        <p className="mx-auto max-w-2xl text-body-large text-neutral-dark">
          הסברים קצרים שיעזרו להבין את ההליך והאפשרויות שעומדות בפניכם.
        </p>
      </header>

      {lawyerVideos.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-neutral-light bg-white p-10 text-center">
          <PlayCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-2 text-h3 font-semibold">סרטונים חדשים יעלו בקרוב</h2>
          <p className="mb-6 text-body text-neutral-dark">
            בינתיים אפשר לתאם שיחת היכרות קצרה או להתחיל בשאלון.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/intro-call" className="rounded border border-primary px-5 py-3 font-semibold text-primary">
              לתיאום שיחה
            </Link>
            <Link href="/wizard" className="rounded bg-primary px-5 py-3 font-semibold text-white">
              להתחלת שאלון
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {lawyerVideos.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-2xl border border-neutral-light bg-white shadow-sm">
              <div className={video.layout === "portrait" ? "aspect-[9/16] bg-neutral-lightest" : "aspect-video bg-neutral-lightest"}>
                {video.kind === "embed" ? (
                  <iframe
                    className="h-full w-full"
                    src={video.videoUrl}
                    title={video.title}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    poster={video.thumbnail}
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                  </video>
                )}
              </div>
              <div className="p-6">
                <h2 className="mb-2 text-h3 font-semibold">{video.title}</h2>
                {video.description && <p className="text-body text-neutral-dark">{video.description}</p>}
                {video.externalUrl && (
                  <a
                    href={video.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex font-semibold text-primary hover:underline"
                  >
                    לצפייה בפייסבוק
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

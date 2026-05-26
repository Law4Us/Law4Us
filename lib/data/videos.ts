export interface LawyerVideo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  externalUrl?: string;
  thumbnail?: string;
  kind: "video" | "embed";
  layout?: "landscape" | "portrait";
}

const homepageVideoUrl = process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_URL;
const facebookPoster = "/images/video overlay ariel-min.webp";

function facebookVideoEmbedUrl(sourceUrl: string): string {
  const params = new URLSearchParams({
    height: "640",
    href: sourceUrl,
    show_text: "false",
    width: "360",
    t: "0",
  });

  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}

/**
 * Add manually approved lawyer videos here. Hosted MP4 files use `video`;
 * iframe providers such as Facebook/YouTube/Vimeo use `embed`.
 */
export const lawyerVideos: LawyerVideo[] = [
  ...(homepageVideoUrl
    ? [
        {
          id: "starting-divorce-process",
          title: "איך מתחילים הליך גירושין?",
          description: "עו״ד אריאל דרור מסביר על השלבים הראשונים בתהליך.",
          videoUrl: homepageVideoUrl,
          thumbnail: facebookPoster,
          kind: "video" as const,
        },
      ]
    : []),
  {
    id: "child-custody-questions",
    title: "אתם שואלים, אני עונה: משמורת על הילדים",
    videoUrl: facebookVideoEmbedUrl("https://www.facebook.com/watch/?v=1181279532660057"),
    externalUrl: "https://www.facebook.com/watch/?v=1181279532660057",
    kind: "embed",
    layout: "portrait",
  },
  {
    id: "prenuptial-agreement-questions",
    title: "אתם שואלים, אני עונה: האם כדאי לעשות הסכם ממון?",
    videoUrl: facebookVideoEmbedUrl("https://www.facebook.com/watch/?v=554853786151868"),
    externalUrl: "https://www.facebook.com/watch/?v=554853786151868",
    kind: "embed",
    layout: "portrait",
  },
  {
    id: "choosing-divorce-lawyer",
    title: "איך בוחרים עורך דין לגירושין?",
    videoUrl: facebookVideoEmbedUrl("https://www.facebook.com/watch/?v=817307485910772"),
    externalUrl: "https://www.facebook.com/watch/?v=817307485910772",
    kind: "embed",
    layout: "portrait",
  },
];

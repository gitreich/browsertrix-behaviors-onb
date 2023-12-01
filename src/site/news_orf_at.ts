import {TikTokVideoBehavior} from "./tiktok";

const Q = {
  orfMain: "//main[@id=\"content\"]",
  orfVideosDivClass: "//div[contains(@class, 'videolane-item')]",
  orfVideosPlayButtonClass: "*[contains(@class, 'videolane-huge-play-button')]",
  orfEmbedVideoClass: "//div[contains(@class, 'oonmedia-video-container')]",
  orfEmbedVideoPlayClass: "//button[contains(@class, 'bmpui-ui-playbacktogglebutton')]",
  orfEmbedVideoLength: "//span[contains(@class, 'bmpui-text-right')]",
  orfEmbededLiveStream: "//div[contains(@class, 'bmpui-oon-livestream')]",
  orfNewsroomTimeline: "//li[contains(@class, 'list-item as-timeline')]",
};

export const BREADTH_ALL = Symbol("BREADTH_ALL");
export class NewsOrfClickVideosBehavior {
  static id = "NewsOrfClickVideos";

  isMobile: boolean;

  static isMatch() {
    return !!window.location.href.match(/https:\/\/(www\.)?([a-z]+\.)?orf\.at/);
    // TODO: Skip Livestream: livestream
  }

  static init() {
    return {
      state: {},
      opts: {breadth: BREADTH_ALL}
    };
  }

  constructor() {
    this.isMobile = false;
  }

  async* clickAllOrfVideos(ctx) {
    const {getState, xpathString, scrollAndClick, xpathNode, waitRandom, iterChildMatches} = ctx.Lib;

    yield getState(ctx, "Starting Clicking ORF Videos");

    const orfMain = xpathNode(Q.orfMain);

    console.log(orfMain);

    // Videos of Newsroom


    // Videos in Articles
    const embedVideoItems = iterChildMatches(Q.orfEmbedVideoClass, orfMain);
    console.log(embedVideoItems);
    for await (const video of embedVideoItems) {
      console.log(video);
      const video_button = xpathNode(Q.orfEmbedVideoPlayClass, video);
      if (video_button != null) {
        await scrollAndClick(video_button);
        await waitRandom();
        const video_length = xpathString(Q.orfEmbedVideoLength, video);
        const time = video_length.split(":");
        var wait = +time[0] * 60 + +time[1];
        wait = wait * 1000;
        yield getState(ctx, "Video started waiting for " + wait + " ms", "Videos");
        await new Promise(f => setTimeout(f, wait ));

        yield getState(ctx, "Video awaited, continue");
      }
    }

    yield getState(ctx, "Click ORF Videos Complete");

  }

  async* clickOrfNewsroomVideo(ctx, video) {
    const {getState, scrollAndClick, xpathNode} = ctx.Lib;

    console.log(video);
    const video_button = xpathNode(Q.orfVideosPlayButtonClass, video);
    console.log(video_button);
    if (!video_button) return;
    await scrollAndClick(video_button);
    yield getState(ctx, "View Video", "Videos");
  }


  async* clickEmbededOrfVideo(ctx, video) {
    const {getState, xpathString, scrollAndClick, xpathNode, waitRandom} = ctx.Lib;

    yield getState(ctx, "Starting Clicking ORF Video");
    // const orfMain = xpathNode(Q.orfMain);
    // const cvideo = xpathNode(video, orfMain);


    console.log(video);
    const video_button = xpathNode(Q.orfEmbedVideoPlayClass, video);
    if (!video_button) return;
    await scrollAndClick(video_button);
    await waitRandom();
    const video_length = xpathString(Q.orfEmbedVideoLength, video);
    const time = video_length.split(":");
    var wait = +time[0] * 60 + +time[1];
    wait = wait * 1000;
    yield getState(ctx, "Video started waiting for " + wait + " ms", "Videos");
    await new Promise(f => setTimeout(f, wait ));

    yield getState(ctx, "Video awaited, continue");
  }

  async* openVideo(ctx, item) {
    const { HistoryState, xpathNode, sleep } = ctx.Lib;
    const link = xpathNode(".//a", item);
    if (!link) return;
    const viewState = new HistoryState(() => link.click());
    await sleep(500);
    if (viewState.changed) {
      const videoBehavior = new TikTokVideoBehavior();
      yield* videoBehavior.run(ctx);
      await sleep(500);
      //await viewState.goBack(Q.backButton);
    }
  }

  async* run(ctx) {
    const {getState,  isMobile, xpathNode, xpathNodes } = ctx.Lib;

    this.isMobile = isMobile();

    yield getState(ctx, "Starting bahviors ONB with isMobile " + this.isMobile );

    ctx.state = {"Videos": 0};

    var vids = new Array();

    const orfMain = xpathNode(Q.orfMain);

    const videoItems = xpathNodes(Q.orfVideosDivClass, orfMain);
    for await (const video of videoItems) {
      yield* await this.clickOrfNewsroomVideo(ctx,video);
    }



    const embedVideoItems = xpathNodes(Q.orfEmbedVideoClass, orfMain);
    for await (const video of embedVideoItems) {
      const livestream = xpathNode(Q.orfEmbededLiveStream, video);
      if (livestream) {
        console.log(livestream);
        continue;
      }
      else {
        this.openVideo(ctx, video);
        vids.push(video);
      }


    }

    console.log(embedVideoItems);
    for (const video of vids) {
      yield* await this.clickEmbededOrfVideo(ctx,video);
    }

    yield "ORF Videos Click Complete";
  }
}

// Per-clip settings. Everything that changes from one clip to another lives here, in data/ or in public/.
export const PROJECT = {
  audio: 'song.m4a',                 // file in public/ (AAC/MP3/WAV)
  creditsSeconds: 13,                // seconds added after the audio ends (title, then credits)
  title: ['THE TYGER', 'DEMO · PUBLIC DOMAIN TEXT'],        // 2 lines
  credits: [['TEXT', 'WILLIAM BLAKE, 1794'], ['AUDIO', 'SYNTHETIC TEST TONE'], ['ENGINE', 'LYRIC-MOTION-METHOD']] as [string,string][],
  // runs of consecutive scene indices that share one continuous camera and join without a cut
  continuousRuns: [] as number[][],
};

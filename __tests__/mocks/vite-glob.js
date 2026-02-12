export const __mockedStories = {
  "../../stories/simple-story.yarn": () => Promise.resolve("title: simple-story\n---\nHello world\n<<stop>>"),
  "../../stories/choice-story.yarn": () => Promise.resolve("title: choice-story\n---\nChoose your path:\n-> \"Option 1\"\n    You chose option 1.\n    <<jump END>>\n-> \"Option 2\"\n    You chose option 2.\n    <<jump END>>\n\n===\n\ntitle: END\n---\nStory complete.\n<<stop>>"),
  "../../stories/pause-story.yarn": () => Promise.resolve("title: pause-story\n---\nThis is a pause test.\n<<pause>>\nAfter pause, continue.\n<<stop>>"),
  "../../stories/command-story.yarn": () => Promise.resolve("title: command-story\n---\nTesting commands:\n<<advanceTime 30>>\n<<changeStat \"strength\" 5>>\n<<showImage \"test.png\">>\n<<addItem \"sword\" 1>>\nCommands executed.\n<<stop>>")
};

export function importMetaGlobRaw() {
  return __mockedStories;
}

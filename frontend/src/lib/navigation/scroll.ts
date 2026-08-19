export function scrollToPageTop(
  scroll: (options: ScrollToOptions) => void,
): void {
  scroll({ top: 0, left: 0, behavior: "instant" });
}

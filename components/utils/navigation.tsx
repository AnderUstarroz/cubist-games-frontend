export const scrollToElement = async (elementId: string) => {
  (document.getElementById(elementId) as HTMLElement).scrollIntoView({
    behavior: "smooth",
  });
};

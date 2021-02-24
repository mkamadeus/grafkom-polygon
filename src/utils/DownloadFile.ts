export const downloadFile = (filename: string, text: string) => {
  const pom = document.createElement("a");
  pom.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  pom.setAttribute("download", filename);

  if (document.createEvent) {
    const event = document.createEvent("MouseEvents");
    event.initEvent("click", true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
};

export const readSingleFile = (e: Event, cb: (e: string) => void) => {
  return () => {
    const file = e.target!.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      const contents = e.target!.result;
      cb(contents as string);
    };
    reader.readAsText(file);
  };
};

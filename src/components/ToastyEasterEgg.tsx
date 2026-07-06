import { useEffect } from "react";

const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
const UPPERCUT_CODE = [40, 65];

type QToastyInstance = {
  trigger: () => void;
  bindKeys: (keys: number[]) => void;
};

type QToastyConstructor = new (params?: {
  domElement?: HTMLElement;
  sound?: boolean;
  volume?: number;
  imageSize?: number;
  keyCodes?: number[];
}) => QToastyInstance;

declare global {
  interface Window {
    QToasty?: QToastyConstructor;
  }
}

function loadQToasty(): Promise<QToastyConstructor> {
  if (window.QToasty) return Promise.resolve(window.QToasty);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-qtoasty]",
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.QToasty) resolve(window.QToasty);
        else reject(new Error("QToasty unavailable"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("QToasty load failed")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/qtoasty.js";
    script.async = true;
    script.dataset.qtoasty = "true";
    script.onload = () => {
      if (window.QToasty) resolve(window.QToasty);
      else reject(new Error("QToasty unavailable"));
    };
    script.onerror = () => reject(new Error("QToasty load failed"));
    document.head.appendChild(script);
  });
}

export function ToastyEasterEgg() {
  useEffect(() => {
    // ⬆ ⬆ ⬇ ⬇ ⬅ ➡ ⬅ ➡ B A or ⬇ A for a surprise
    console.log("⬆ ⬆ ⬇ ⬇ ⬅ ➡ ⬅ ➡ B A or ⬇ A for a surprise");

    let cancelled = false;

    void loadQToasty().then((QToasty) => {
      if (cancelled) return;

      new QToasty({
        domElement: document.body,
        sound: true,
        volume: 0.5,
        keyCodes: KONAMI_CODE,
      });

      new QToasty({
        domElement: document.body,
        sound: true,
        volume: 0.5,
        keyCodes: UPPERCUT_CODE,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

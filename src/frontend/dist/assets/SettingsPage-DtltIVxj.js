import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, m as motion } from "./index-Dra4aKhn.js";
import { I as Input, u as ue } from "./index-B4MtT_7t.js";
import { a as LoaderCircle, L as Label, S as Save } from "./label-BL4FdnpB.js";
import { S as Skeleton } from "./skeleton-B-U1R3Ak.js";
import { e as useSerpApiKey, f as useSetSerpApiKey, g as useClearSerpApiKey } from "./useBackend-fR6Z4du_.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const EyeOff = createLucideIcon("eye-off", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]
];
const Key = createLucideIcon("key", __iconNode);
function SettingsPage() {
  const { data: currentKey, isLoading } = useSerpApiKey();
  const { mutate: saveKey, isPending: isSaving } = useSetSerpApiKey();
  const { mutate: clearKey, isPending: isClearing } = useClearSerpApiKey();
  const [apiKey, setApiKey] = reactExports.useState("");
  const [showKey, setShowKey] = reactExports.useState(false);
  const [showClearConfirm, setShowClearConfirm] = reactExports.useState(false);
  const isPending = isSaving || isClearing;
  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      ue.error("Enter a valid API key");
      return;
    }
    saveKey(trimmed, {
      onSuccess: () => {
        ue.success("SerpAPI key saved successfully");
        setApiKey("");
      },
      onError: () => ue.error("Failed to save key — please try again")
    });
  };
  const handleClear = () => {
    clearKey(void 0, {
      onSuccess: () => {
        ue.success("API key removed");
        setShowClearConfirm(false);
      },
      onError: () => ue.error("Failed to remove key")
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 },
      className: "max-w-2xl mx-auto px-4 sm:px-6 py-8",
      "data-ocid": "settings.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-semibold text-xl text-foreground", children: "Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Configure your account and integrations" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.section,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.45, delay: 0.1 },
            className: "rounded-sm overflow-hidden",
            style: {
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-3 px-5 py-4",
                  style: { borderBottom: "1px solid rgba(255,255,255,0.07)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "w-8 h-8 rounded-sm flex items-center justify-center shrink-0",
                        style: {
                          background: "rgba(99,51,255,0.15)",
                          border: "1px solid rgba(99,51,255,0.35)",
                          boxShadow: "0 0 12px rgba(99,51,255,0.25)"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-4 h-4 text-purple-300" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground", children: "SerpAPI Key" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Powers Google Maps ranking lookups for your grid scans" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-5 space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: -8 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.4, delay: 0.2 },
                    className: "flex items-start gap-3 p-4 rounded-sm",
                    style: {
                      background: "rgba(0,217,255,0.06)",
                      border: "1px solid rgba(0,217,255,0.2)",
                      boxShadow: "0 0 20px rgba(0,217,255,0.06) inset"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CircleAlert,
                        {
                          className: "w-4 h-4 mt-0.5 shrink-0",
                          style: {
                            color: "rgb(34,211,238)",
                            filter: "drop-shadow(0 0 4px rgba(0,217,255,0.6))"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs leading-relaxed", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "font-semibold font-mono",
                            style: {
                              color: "rgb(103,232,249)",
                              textShadow: "0 0 6px rgba(0,217,255,0.4)"
                            },
                            children: "Each 3×3 grid scan uses 9 API credits"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                          " ",
                          "— one request per grid point. On SerpAPI's free plan (100 searches/month), you get ~11 full scans. Failed requests do not count against your quota."
                        ] })
                      ] })
                    ]
                  }
                ),
                isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-52 opacity-30" }) : currentKey ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center justify-between gap-3 p-3 rounded-sm",
                    style: {
                      background: "rgba(0,217,255,0.07)",
                      border: "1px solid rgba(0,217,255,0.25)",
                      boxShadow: "0 0 12px rgba(0,217,255,0.08) inset"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          CircleCheckBig,
                          {
                            className: "w-4 h-4 shrink-0",
                            style: {
                              color: "rgb(34,211,238)",
                              filter: "drop-shadow(0 0 3px rgba(0,217,255,0.5))"
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "span",
                          {
                            className: "text-xs font-mono truncate",
                            style: {
                              color: "rgb(103,232,249)",
                              textShadow: "0 0 6px rgba(0,217,255,0.3)",
                              letterSpacing: "0.05em"
                            },
                            children: [
                              "Active: ",
                              currentKey.slice(0, 8),
                              "•".repeat(Math.min(8, currentKey.length - 8))
                            ]
                          }
                        )
                      ] }),
                      !showClearConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowClearConfirm(true),
                          className: "text-xs text-muted-foreground hover:text-rose-400 transition-colors shrink-0 font-mono",
                          "data-ocid": "settings.clear_key_button",
                          children: "Remove"
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-mono", children: "Confirm?" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: handleClear,
                            disabled: isPending,
                            className: "text-xs font-mono font-medium transition-colors disabled:opacity-50",
                            style: { color: "rgb(251,113,133)" },
                            "data-ocid": "settings.confirm_clear_button",
                            children: isClearing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }) : "Yes, remove"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => setShowClearConfirm(false),
                            className: "text-xs text-muted-foreground hover:text-foreground transition-colors font-mono",
                            "data-ocid": "settings.cancel_clear_button",
                            children: "Cancel"
                          }
                        )
                      ] })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 p-3 rounded-sm",
                    style: {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                        "No API key configured.",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "a",
                          {
                            href: "https://serpapi.com/users/sign_up",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "transition-colors",
                            style: {
                              color: "rgb(0,217,255)",
                              textDecoration: "underline"
                            },
                            children: "Sign up for SerpAPI"
                          }
                        ),
                        " ",
                        "to get your free key."
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Label,
                      {
                        htmlFor: "serpApiKey",
                        className: "text-xs font-medium text-foreground",
                        children: currentKey ? "Update API Key" : "Enter API Key"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          id: "serpApiKey",
                          type: showKey ? "text" : "password",
                          placeholder: "e.g. abc123def456…",
                          value: apiKey,
                          onChange: (e) => setApiKey(e.target.value),
                          onKeyDown: (e) => e.key === "Enter" && handleSave(),
                          className: "h-9 text-sm font-mono pr-10 transition-all duration-200",
                          style: {
                            background: "rgba(99,51,255,0.07)",
                            border: "1px solid rgba(99,51,255,0.3)",
                            color: "rgb(216,180,254)"
                          },
                          autoComplete: "off",
                          spellCheck: false,
                          "data-ocid": "settings.api_key_input"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowKey((v) => !v),
                          className: "absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors",
                          style: { color: "rgba(168,85,247,0.7)" },
                          "aria-label": showKey ? "Hide API key" : "Show API key",
                          "data-ocid": "settings.toggle_key_visibility",
                          children: showKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        className: "h-8 px-3 text-xs font-display font-semibold rounded-sm flex items-center gap-1.5 transition-all duration-300 disabled:opacity-50",
                        style: {
                          background: apiKey.trim() ? "linear-gradient(135deg, rgba(99,51,255,0.9) 0%, rgba(0,140,255,0.9) 100%)" : "rgba(99,51,255,0.2)",
                          border: "1px solid rgba(120,80,255,0.5)",
                          boxShadow: apiKey.trim() ? "0 0 16px rgba(99,51,255,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                          color: "#fff"
                        },
                        onClick: handleSave,
                        disabled: isPending || !apiKey.trim(),
                        "data-ocid": "settings.save_api_key_button",
                        children: [
                          isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5" }),
                          currentKey ? "Update Key" : "Save Key"
                        ]
                      }
                    ),
                    !apiKey.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Paste your key above to enable save" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ExternalLink,
                    {
                      className: "w-3.5 h-3.5 shrink-0",
                      style: { color: "rgba(0,217,255,0.5)" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "Don't have a key?",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "a",
                      {
                        href: "https://serpapi.com/users/sign_up",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "transition-colors",
                        style: { color: "rgb(0,217,255)", textDecoration: "underline" },
                        "data-ocid": "settings.serpapi_signup_link",
                        children: "Sign up at serpapi.com"
                      }
                    ),
                    " ",
                    "— free plan includes 100 searches/month."
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "px-5 py-3",
                  style: {
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(0,0,0,0.15)"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Privacy:" }),
                    " Your SerpAPI key is stored in your personal canister on the Internet Computer and is never shared with other users or visible in network requests."
                  ] })
                }
              )
            ]
          }
        )
      ]
    }
  );
}
export {
  SettingsPage as default
};

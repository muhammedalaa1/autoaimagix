const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso));

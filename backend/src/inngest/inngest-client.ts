import { Inngest } from "inngest";

export const inngest = new Inngest({ 
    id: "csv-parser", 
    isDev: process.env.INNGEST_DEV === "1"
});
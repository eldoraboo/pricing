import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import pdf from "pdf-parse";

interface ParsedData {
  [key: string]: number;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {

  function getWeek(d: any) {
    let yearStart = +new Date(d.getFullYear(), 0, 1);
    let today = +new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let dayOfYear = (today - yearStart + 1) / 86400000;
    let week = Math.ceil(dayOfYear / 7).toString();
    const resWeek = week;
    return resWeek
  }

  try {
    // Get the current date
    const currentDate = new Date();

    // Calculate the date seven days ago
    const beforeDate : any = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    // Get the week and year of the date seven days ago
    const week = getWeek(beforeDate);
    const year = beforeDate.getUTCFullYear();

    // Format the PDF URL with the previous week and year
    const pdfUrl = `https://www.clal.it/upload/COTATIONS%20ATLA%20-%20Semaine%20${week}%20${year}.pdf`;

    // Fetch the PDF content
    const { data } = await axios.get<ArrayBuffer>(pdfUrl, {
      responseType: "arraybuffer",
    });

    // Parse PDF content to text
    const pdfText = await pdf(data);

    // Split the text into lines
    const lines = pdfText.text.split("\n");

    // Create an object to store the parsed data
    const parsedData: ParsedData = {};

    /// Define keys to look for in the text
    const keysToFind = ["Consommation humaine", "Consommation animale"];

    for (const line of lines) {
      for (const key of keysToFind) {
        if (line.includes(key)) {
          const value = parseInt(line.replace(/\D/g, ""), 10);
          if (!isNaN(value)) {
            parsedData[key] = value;
          }
        }
      }
    }

    const poudre26Index = lines.findIndex((line: any) =>
      line.includes("Poudre 26 %")
    );
    const poudre26Value = parseInt(
      lines[poudre26Index + 1].replace(/\D/g, ""),
      10
    );

    parsedData["Poudre 26 %"] = poudre26Value;

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error extracting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

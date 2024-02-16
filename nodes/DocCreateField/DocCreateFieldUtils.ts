import { IBinaryData } from "n8n-workflow";
import { PDFPage, rgb } from "pdf-lib";

const isPDFDocument = (data: IBinaryData) => data.mimeType === 'application/pdf';

interface DocCreateFieldConfig {
    page: number,
    value: string;
    options: {
        x: number,
        y: number,
        size: number | undefined,
        opacity: number | undefined,
        colorRed: number | undefined,
        colorGreen: number | undefined,
        colorBlue: number | undefined,
    }
}

const createField = (pdfPage: PDFPage, config: DocCreateFieldConfig): void => {
    pdfPage.drawText(config.value, {
        x: config.options.x,
        y: config.options.y,
        size: config.options.size ? config.options.size : 24,
        opacity: config.options.opacity ? config.options.opacity : 1,
        color: rgb(
            config.options.colorRed ? config.options.colorRed : 0, 
            config.options.colorGreen ? config.options.colorGreen : 0, 
            config.options.colorBlue ? config.options.colorBlue : 0
        ),
    })
}

export { isPDFDocument, createField, DocCreateFieldConfig }
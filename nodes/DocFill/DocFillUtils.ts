import { IBinaryData } from "n8n-workflow";
import { PDFCheckBox, PDFDropdown, PDFForm, PDFRadioGroup, PDFTextField } from "pdf-lib";

const isPDFDocument = (data: IBinaryData) => data.mimeType === 'application/pdf';

interface DocFillConfig {
    key: string;
    value: string;
    type: 'textfield' | 'checkbox' | 'dropdown' | 'radiogroup';
}

const fillForm = (pdfForm: PDFForm, config: DocFillConfig): void => {
    switch(config.type) {
        case 'textfield': {
            const pdfTextField = pdfForm.getTextField(config.key);
            fillFormTextField(pdfTextField, config);
            break;
        }
        case 'checkbox': {
            const pdfCheckBox = pdfForm.getCheckBox(config.key);
            fillFormCheckbox(pdfCheckBox, config);
            break;
        }
        case 'dropdown': {
            const pdfDropdown = pdfForm.getDropdown(config.key);
            fillFormDropdown(pdfDropdown, config);
            break;
        }
        case 'radiogroup': {
            const pdfRadioGroup = pdfForm.getRadioGroup(config.key);
            fillFormRadioGroup(pdfRadioGroup, config);
            break;
        }
    }
}

const fillFormTextField = (pdfTextField: PDFTextField, config: DocFillConfig): void => {
    pdfTextField.setText(config.value);
}

const fillFormCheckbox = (pdfCheckBox: PDFCheckBox, config: DocFillConfig): void => {
    if(config.value === 'true') {
        pdfCheckBox.check();
    } else {
        pdfCheckBox.uncheck();
    }
}

const fillFormDropdown = (pdfDropdown: PDFDropdown, config: DocFillConfig): void => {
    pdfDropdown.select(config.value);
}

const fillFormRadioGroup = (pdfRadioGroup: PDFRadioGroup, config: DocFillConfig): void => {
    pdfRadioGroup.select(config.value);
}

export { isPDFDocument, fillForm, DocFillConfig }
import {
	IBinaryData,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import fetch from 'node-fetch';
import { PDFDocument, PDFForm, PDFTextField } from 'pdf-lib';

export class DocFill implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Doc Fill',
		name: 'docFill',
		group: ['transform'],
		version: 1,
		description: 'Node made for filling a pdf form.',
		defaults: {
			name: 'Doc Fill',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'PDF Url',
				name: 'pdfUrl',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'URL where the PDF file can be downloaded.',
				required: true,
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		//let item: INodeExecutionData;
		let fileUrl: string;
		let arrayBuffer: ArrayBuffer;
		let pdfDoc: PDFDocument;
		let pdfForm: PDFForm;

		const returnData: INodeExecutionData[] = [];


		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				fileUrl = this.getNodeParameter('pdfUrl', itemIndex, '') as string;

				arrayBuffer = await fetch(fileUrl).then(res => res.arrayBuffer());

				pdfDoc = await PDFDocument.load(arrayBuffer);

				console.log(pdfDoc);

				pdfForm = pdfDoc.getForm();

				let pdfTextField: PDFTextField = pdfForm.getTextField("Nom et prénom ou raison sociale_2");
				pdfTextField.setText("Roman Muzikantov");

				let savedDoc = await pdfDoc.save();

				console.log(savedDoc);

				const binary = { 
					["data"]: {
						data: "",
						fileName: 'fileName',
						mimeType: 'mimeType'
					} as IBinaryData
				};
				binary!['data'] = await this.helpers.prepareBinaryData(Buffer.from(savedDoc), 'test.pdf')

				const json = {};
				const result: INodeExecutionData = {
					json,
					binary
				}

				returnData.push(result);
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return this.prepareOutputData(returnData);
	}
}

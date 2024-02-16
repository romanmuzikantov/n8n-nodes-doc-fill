import {
	IBinaryData,
	IBinaryKeyData,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	IPairedItemData,
	NodeOperationError,
} from 'n8n-workflow';


import { isPDFDocument, DocCreateFieldConfig, createField } from './DocCreateFieldUtils';
import { PDFDocument } from 'pdf-lib';

const nodeOperationOptions: INodeProperties[] = [
	{
		displayName: 'Property Name',
		name: 'dataPropertyName',
		type: 'string',
		default: 'data',
		description:
			'Name of the binary property which holds the document to be used',
	},
	{
		displayName: 'Property Name Out',
		name: 'dataPropertyNameOut',
		type: 'string',
		default: 'data',
		description:
			'Name of the binary property for the output',
	},
	{
		displayName: 'Configuration JSON',
		name: 'configurationJson',
		type: 'json',
		default: '',
		description:
			'JSON defining the fields to be created in the PDF passed as input',
	},
];

export class DocCreateField implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Doc Create Field',
		name: 'docCreateField',
		group: ['transform'],
		version: 1,
		description: 'Node made for creating a field inside a PDF doc.',
		defaults: {
			name: 'Doc Create Field',
		},
		inputs: ['main'],
		inputNames: ['Document'],
		outputs: ['main'],
		properties: [
			...nodeOperationOptions
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let itemBinaryData: IBinaryKeyData;
		let dataPropertyName: string;
		let dataPropertyNameOut: string;
		let jsonString: string;
		let docCreateFieldConfigs: DocCreateFieldConfig[];
		let docBinaryData: IBinaryData;
		let docBuffer: Buffer;
		let pdfDoc: PDFDocument;

		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				dataPropertyName = this.getNodeParameter('dataPropertyName', itemIndex, '') as string;
				dataPropertyNameOut = this.getNodeParameter('dataPropertyNameOut', itemIndex, '') as string;
				jsonString = this.getNodeParameter('configurationJson', itemIndex, '') as string;

			try {
				itemBinaryData = items[itemIndex].binary as IBinaryKeyData;
				docBinaryData = itemBinaryData[dataPropertyName] as IBinaryData;

				if(!isPDFDocument(docBinaryData)) {
					throw new NodeOperationError(
						this.getNode(),
						`Input (on binary property "${dataPropertyName}") should be a PDF file, was ${docBinaryData.mimeType} instead`,
						{ itemIndex },
					);
				}

				docBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, dataPropertyName);
				pdfDoc = await PDFDocument.load(docBuffer);


				docCreateFieldConfigs = JSON.parse(jsonString);

				docCreateFieldConfigs.forEach((el) => {
					const pdfPage = pdfDoc.getPage(el.page);
					createField(pdfPage, el);
				})

				let savedDoc = await pdfDoc.save();

				const result: INodeExecutionData = {
					json: {
						...items[itemIndex].json
					},
					binary: {
						...items[itemIndex].binary,
						[dataPropertyNameOut]: await this.helpers.prepareBinaryData(
							Buffer.from(savedDoc), 
							docBinaryData.fileName ? docBinaryData.fileName : dataPropertyNameOut + '.pdf', 
							'application/pdf'
						),
					},
					pairedItem: [items[itemIndex].pairedItem as IPairedItemData],
				}

				returnData.push(result);
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
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

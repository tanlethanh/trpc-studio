import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Header {
	key: string;
	value: string;
}

interface HeadersPanelProps {
	headers: Header[];
	onChange: (headers: Header[]) => void;
}

const PROTECTED_HEADERS = ['authorization', 'content-type'];

export function HeadersPanel({ headers, onChange }: HeadersPanelProps) {
	const [localHeaders, setLocalHeaders] = useState<Header[]>(() => {
		// Ensure required headers exist
		const hasAuth = headers.some(h => h.key.toLowerCase() === 'authorization');
		const hasContentType = headers.some(h => h.key.toLowerCase() === 'content-type');
		const newHeaders = [...headers];

		if (!hasAuth) {
			newHeaders.unshift({ key: 'Authorization', value: '' });
		}
		if (!hasContentType) {
			newHeaders.unshift({ key: 'Content-Type', value: 'application/json' });
		}
		return newHeaders;
	});

	useEffect(() => {
		// Ensure required headers exist when headers prop changes
		const hasAuth = headers.some(h => h.key.toLowerCase() === 'authorization');
		const hasContentType = headers.some(h => h.key.toLowerCase() === 'content-type');
		const newHeaders = [...headers];

		if (!hasAuth) {
			newHeaders.unshift({ key: 'Authorization', value: '' });
		}
		if (!hasContentType) {
			newHeaders.unshift({ key: 'Content-Type', value: 'application/json' });
		}
		setLocalHeaders(newHeaders);
	}, [headers]);

	const handleAddHeader = () => {
		const newHeaders = [...localHeaders, { key: '', value: '' }];
		setLocalHeaders(newHeaders);
		onChange(newHeaders);
	};

	const handleRemoveHeader = (index: number) => {
		// Prevent removing protected headers
		const header = localHeaders[index];
		if (PROTECTED_HEADERS.includes(header.key.toLowerCase())) {
			return;
		}
		const newHeaders = localHeaders.filter((_, i) => i !== index);
		setLocalHeaders(newHeaders);
		onChange(newHeaders);
	};

	const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
		const newHeaders = localHeaders.map((header, i) => {
			if (i === index) {
				// Prevent changing protected header keys
				if (field === 'key' && PROTECTED_HEADERS.includes(header.key.toLowerCase())) {
					return header;
				}
				return { ...header, [field]: value };
			}
			return header;
		});
		setLocalHeaders(newHeaders);
		onChange(newHeaders);
	};

	const isProtectedHeader = (key: string) => PROTECTED_HEADERS.includes(key.toLowerCase());

	return (
		<Card className="h-full">
			<CardContent className="p-4">
				<div className="flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<h3 className="text-sm font-medium">Request Headers</h3>
						<Button
							variant="outline"
							size="sm"
							onClick={handleAddHeader}
							className="h-8"
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Header
						</Button>
					</div>
					<div className="flex flex-col gap-2">
						{localHeaders.map((header, index) => (
							<div key={index} className="flex gap-2 items-center">
								<Input
									placeholder="Header name"
									value={header.key}
									onChange={e => handleHeaderChange(index, 'key', e.target.value)}
									className="flex-1"
									disabled={isProtectedHeader(header.key)}
								/>
								<Input
									placeholder={
										header.key.toLowerCase() === 'authorization'
											? 'Bearer your-token-here'
											: 'Header value'
									}
									value={header.value}
									onChange={e =>
										handleHeaderChange(index, 'value', e.target.value)
									}
									className="flex-1"
									disabled={header.key.toLowerCase() === 'content-type'}
								/>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleRemoveHeader(index)}
									className="h-8 w-8"
									disabled={isProtectedHeader(header.key)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

import { CheckCircle2, Clock, Code, FileText } from 'lucide-react';

type Tab = 'result' | 'history' | 'introspection' | 'headers';

type Props = {
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
};

export function Tabs({ activeTab, setActiveTab }: Props) {
	return (
		<div className="flex items-center gap-2">
			<button
				onClick={() => setActiveTab('result')}
				className={`px-3 py-1 text-sm rounded-md ${
					activeTab === 'result'
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-muted'
				}`}
			>
				<span className="hidden sm:inline">Result</span>
				<CheckCircle2 className="h-4 w-4 sm:hidden" />
			</button>
			<button
				onClick={() => setActiveTab('history')}
				className={`px-3 py-1 text-sm rounded-md ${
					activeTab === 'history'
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-muted'
				}`}
			>
				<span className="hidden sm:inline">History</span>
				<Clock className="h-4 w-4 sm:hidden" />
			</button>
			<button
				onClick={() => setActiveTab('introspection')}
				className={`px-3 py-1 text-sm rounded-md ${
					activeTab === 'introspection'
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-muted'
				}`}
			>
				<span className="hidden sm:inline">Introspection</span>
				<Code className="h-4 w-4 sm:hidden" />
			</button>
			<button
				onClick={() => setActiveTab('headers')}
				className={`px-3 py-1 text-sm rounded-md ${
					activeTab === 'headers'
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-muted'
				}`}
			>
				<span className="hidden sm:inline">Headers</span>
				<FileText className="h-4 w-4 sm:hidden" />
			</button>
		</div>
	);
}

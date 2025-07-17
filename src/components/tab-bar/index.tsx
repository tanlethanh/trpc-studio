/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import { cn } from '@/lib/utils';

export type TabItem<T extends string> = {
	key: T;
	title: string;
	icon: FC<{ className: string }>;
	flag?: 'new' | 'none';
};

type Props<T extends TabItem<any>> = {
	tabs: T[];
	activeTab: T | null;
	setActiveTab: (tab: T) => void;
};

export const useTabBar = <T extends TabItem<any>>(tabData: T[]) => {
	const [tabs, setTabs] = useState(tabData);
	const [activeTab, setActiveTab] = useState<T | null>(tabData[0] ?? null);

	const setTabFlag = (key: T['key'], flag: T['flag']) => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) => (tab.key === key ? { ...tab, flag } : tab)),
		);
	};

	const toggleTagFlag = (key: T['key'], flag: T['flag']) => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) =>
				tab.key === key
					? { ...tab, flag: tab.flag === flag ? undefined : flag }
					: tab,
			),
		);
	};

	return {
		tabs,
		activeTab,
		setTabFlag,
		setActiveTab,
		toggleTagFlag,
	};
};

export const TabBar = <T extends TabItem<any>>({
	tabs,
	activeTab,
	setActiveTab,
}: Props<T>) => {
	return (
		<div className="flex items-center gap-2">
			{tabs.map((tab) => {
				const Icon = tab.icon;

				return (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab)}
						className={cn(
							'px-3 py-1 text-sm rounded-md relative',
							activeTab?.key === tab.key
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-muted',
						)}
					>
						<span className="hidden sm:inline">{tab.title}</span>
						<Icon className="h-4 w-4 sm:hidden" />
						{tab.flag === 'new' && (
							<span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
						)}
					</button>
				);
			})}
		</div>
	);
};

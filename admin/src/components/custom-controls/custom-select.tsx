import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

interface ISelectProps {
	value?: string;
	defaultValue?: string;
	onValueChange: (value: string) => void;
	options: { value: string; label: string; color?: string }[];
	placeholder: string;
	className?: string;
	disabled?: boolean; // 1. Add disabled to interface
}

const CustomSelect = ({
	value,
	defaultValue,
	onValueChange,
	options,
	placeholder,
	className,
	disabled = false // 2. Destructure with default value
}: ISelectProps) => {
	return (
		<Select 
			value={value} 
			defaultValue={defaultValue} 
			onValueChange={onValueChange}
			disabled={disabled} // 3. Pass to Select root
		>
			<SelectTrigger 
				className={`w-full ${className}`}
				disabled={disabled} // 4. Pass to SelectTrigger for correct styling/behavior
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value} className={option.color}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default CustomSelect;

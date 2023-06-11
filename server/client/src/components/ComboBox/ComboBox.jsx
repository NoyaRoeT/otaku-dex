import React, { useState } from "react";
import { Autocomplete, TextField, useTheme } from "@mui/material";

const defaultOptions = ["Fantasy", "Action", "Sci-Fi", "Default1", "Default2"];

const ComboBox = ({
	error,
	required,
	id,
	label,
	value,
	options,
	sx,
	onChange,
}) => {
	const [chosen, setChosen] = useState(value ? value : []);

	function handleChange(event, value) {
		setChosen(value);
		if (onChange) {
			onChange(value);
		}
	}

	return (
		<Autocomplete
			disableClearable
			multiple
			value={chosen}
			onChange={handleChange}
			sx={{ ...sx }}
			popupIcon={false}
			options={!options ? defaultOptions : options}
			getOptionDisabled={(option) => {
				return chosen.some((item) => item === option);
			}}
			renderInput={(params) => (
				<TextField
					error={error}
					required={required}
					margin="normal"
					{...params}
					variant="outlined"
					{...params}
					id={id}
					label={label}
				/>
			)}
		/>
	);
};

export default ComboBox;
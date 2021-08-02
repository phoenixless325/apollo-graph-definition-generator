import upperFirst from 'lodash.upperfirst';
import camelCase from 'lodash.camelcase';
import transform from 'lodash.transform';
import pick from 'lodash.pick';
import requireAll from './requireAll';
import path from 'path';

export default (enumsDir, keywords) => {
	
	let constants = requireAll({
		dirname: enumsDir,
		filter: /(.+)\.js$/,
		recursive: true
	});
	
	return constants.reduce((acc, val) => {
		const name = path.basename(val.filePath, '.js');
		
		const existingKeywords = transform(val.content, (acc, val, key) => {
			
			const keyword = keywords.find(v => key.includes(v)) ?? 'DEFAULT';
			
			if (keyword && !acc.includes(keyword))
				acc.push(keyword);
			
		}, []);
		
		for (const existingKeyword of existingKeywords) {
			
			const isDefault = existingKeyword === 'DEFAULT';
			
			const key = upperFirst(camelCase(`${name} ${isDefault ? '' : existingKeyword}`)).trim();
			
			acc[key] = isDefault
				? transform(val.content, (acc, val, key) => {
					if (!keywords.find(v => key.includes(v)))
						acc[key] = val;
				}, {})
				: pick(val.content, Object.keys(val.content).filter(v => v.includes(existingKeyword)));
		}
		
		return acc;
	}, {});
};

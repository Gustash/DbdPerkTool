import React from "react";
import PlainTextInput from "./Form/PlainTextInput";

type MyProps = {
    onSetParent: (pack: any) => void;
    packs: Array<any>;
    defaultSelected?: any;
}

export async function buildPackLabel(pack: any) {
    return {...pack, label: `${pack.author} - ${pack.name}`};
}

export function ParentSelector(props: MyProps) {
    return (<PlainTextInput
        label="Parent"
        onChange={(selected: any) => {
            if (selected && selected.length > 0) {
                const targetPack = selected[0];
                props.onSetParent(targetPack);
            } else {
                props.onSetParent(undefined);
            }
        }}
        defaultSelected={!!props.defaultSelected ? [props.defaultSelected] : undefined}
        options={props.packs}
    />)

}
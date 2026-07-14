package com.linercore.platform.referencedata.container.api;

import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class ReferenceSetConverter implements Converter<String, ReferenceSet> {
    @Override
    public ReferenceSet convert(String source) {
        return ReferenceSet.fromExternalValue(source);
    }
}

import React from 'react';
import { getHeadElementDescriptors, HeadElementDescriptor } from './metadata';
import { NextMetadataProps } from './types';

export function HeadElements(props: NextMetadataProps) {
  const descriptors = getHeadElementDescriptors(props);

  return (
    <>
      {descriptors.map((descriptor, index) => {
        if (descriptor.tag === 'style' && descriptor.content) {
          return (
            <style
              key={`style-${index}`}
              dangerouslySetInnerHTML={{ __html: descriptor.content }}
              suppressHydrationWarning
            />
          );
        }

        if (descriptor.tag === 'script') {
          if (descriptor.attributes?.type === 'application/ld+json' && descriptor.content) {
            return (
              <script
                key={`script-${index}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: descriptor.content }}
                suppressHydrationWarning
              />
            );
          }

          if (descriptor.attributes?.src) {
            const attrs = descriptor.attributes as Record<string, string | boolean>;
            return (
              <script
                key={`script-${index}`}
                src={attrs.src as string}
                defer={attrs.defer === true}
                async={attrs.async === true}
                type={attrs.type as string | undefined}
                suppressHydrationWarning
              />
            );
          }
        }

        if (descriptor.tag === 'link' && descriptor.attributes) {
          const attrs = descriptor.attributes as Record<string, string>;
          return <link key={`link-${index}`} {...attrs} />;
        }

        return null;
      })}
    </>
  );
}

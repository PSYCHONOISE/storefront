<script lang="ts">
  // Component props
  let {
    attributes = [],
    metadata = [],
    title = "Product Details",
    showTitle = true,
    variant = 'detailed' // 'detailed' | 'compact' | 'inline'
  }: {
    attributes?: any[];
    metadata?: any[];
    title?: string;
    showTitle?: boolean;
    variant?: 'detailed' | 'compact' | 'inline';
  } = $props();

  // Filter and format attributes
  const visibleAttributes = attributes?.filter(attr => 
    attr.values?.length > 0 && 
    attr.attribute?.name &&
    !attr.attribute.slug?.startsWith('_') // Skip private attributes
  ) || [];

  const visibleMetadata = metadata?.filter(meta => 
    meta.key && meta.value &&
    !meta.key.startsWith('_') // Skip private metadata
  ) || [];

  // Format attribute value based on type
  function formatAttributeValue(attribute: any, value: any) {
    const attrType = attribute?.attribute?.type || 'TEXT';
    
    switch (attrType) {
      case 'DATE':
        return value.date ? new Date(value.date).toLocaleDateString() : value.value;
      case 'DATETIME':
        return value.dateTime ? new Date(value.dateTime).toLocaleString() : value.value;
      case 'BOOLEAN':
        return value.value === 'true' ? 'Yes' : 'No';
      case 'NUMERIC':
        return value.value + (attribute?.attribute?.unit ? ` ${attribute.attribute.unit}` : '');
      case 'RICH_TEXT':
        return value.richText || value.value;
      case 'FILE':
        return value.file?.url ? 'File attached' : value.value;
      default:
        return value.name || value.value;
    }
  }

  // Check if attribute has file/image
  function hasFile(value: any) {
    return value.file?.url && value.file?.contentType;
  }

  // Check if it's an image file
  function isImage(contentType: string) {
    return contentType?.startsWith('image/');
  }
</script>

{#if visibleAttributes.length > 0 || visibleMetadata.length > 0}
  <div class="product-attributes {variant}">
    {#if showTitle}
      <h3 class="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
    {/if}

    {#if variant === 'detailed'}
      <!-- Detailed view with full formatting -->
      <div class="space-y-6">
        {#if visibleAttributes.length > 0}
          <div>
            <h4 class="mb-3 text-base font-medium text-gray-800">Product Attributes</h4>
            <div class="grid gap-4 sm:grid-cols-2">
              {#each visibleAttributes as attribute}
                <div class="rounded-lg border border-gray-200 p-4">
                  <dt class="text-sm font-medium text-gray-600">
                    {attribute.attribute.name}
                  </dt>
                  <dd class="mt-2">
                    {#each attribute.values as value}
                      <div class="flex items-center space-x-2">
                        {#if hasFile(value) && isImage(value.file.contentType)}
                          <img 
                            src={value.file.url} 
                            alt={value.name || 'Attribute image'}
                            class="h-8 w-8 rounded object-cover"
                          />
                        {/if}
                        <span class="text-sm text-gray-900">
                          {formatAttributeValue(attribute, value)}
                        </span>
                        {#if hasFile(value) && !isImage(value.file.contentType)}
                          <a 
                            href={value.file.url} 
                            target="_blank" 
                            class="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Download
                          </a>
                        {/if}
                      </div>
                    {/each}
                  </dd>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if visibleMetadata.length > 0}
          <div>
            <h4 class="mb-3 text-base font-medium text-gray-800">Additional Information</h4>
            <div class="grid gap-3 sm:grid-cols-2">
              {#each visibleMetadata as meta}
                <div class="flex justify-between border-b border-gray-100 pb-2">
                  <dt class="text-sm font-medium text-gray-600 capitalize">
                    {meta.key.replace(/[_-]/g, ' ')}
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {meta.value}
                  </dd>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

    {:else if variant === 'compact'}
      <!-- Compact view for cards -->
      <div class="space-y-2">
        {#each visibleAttributes.slice(0, 3) as attribute}
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">{attribute.attribute.name}:</span>
            <span class="font-medium text-gray-900">
              {attribute.values.map(v => v.name || v.value).join(', ')}
            </span>
          </div>
        {/each}
        
        {#if visibleAttributes.length > 3}
          <div class="text-xs text-gray-500">
            +{visibleAttributes.length - 3} more attributes
          </div>
        {/if}
      </div>

    {:else}
      <!-- Inline view for minimal space -->
      <div class="flex flex-wrap gap-2">
        {#each visibleAttributes.slice(0, 2) as attribute}
          {#each attribute.values.slice(0, 1) as value}
            <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              {attribute.attribute.name}: {value.name || value.value}
            </span>
          {/each}
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .product-attributes.detailed {
    @apply bg-gray-50 rounded-lg p-6;
  }
  
  .product-attributes.compact {
    @apply bg-white border border-gray-200 rounded p-4;
  }
  
  .product-attributes.inline {
    @apply mt-2;
  }
</style>

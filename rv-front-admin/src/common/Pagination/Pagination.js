import { ref, computed } from 'vue'

export function usePagination(fetchDataFunction, pagination) {
  const currentPageData = computed(() => {
    const displayPageSize = pagination.value.displayPageSize
    const serverPageSize = pagination.value.serverPageSize
    const pagesPerServerPage = serverPageSize / displayPageSize

    // 计算当前服务器页码
    const serverPage = Math.floor((pagination.value.currentPage - 1) / pagesPerServerPage) + 1
    // 获取当前服务器页的数据
    const currentServerData = pagination.value.cachedData.get(serverPage) || []
    // 计算在当前服务器页内的偏移量
    const offset = ((pagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
    return currentServerData.slice(offset, offset + displayPageSize)
  })

  const handleLoadData = async (serverPage) => {
    if (pagination.value.cachedData.has(serverPage)) {
      console.log("使用缓存数据，页码：", serverPage)
      return
    }
    pagination.value.serverPage = serverPage
    await fetchDataFunction()
  }

  const clearCache = () => {
    pagination.value.currentPage = 1
    pagination.value.serverPage = 1
    pagination.value.cachedData.clear()
    pagination.value.totalItems = 0
  }

  return {
    currentPageData,
    handleLoadData,
    clearCache
  }
}
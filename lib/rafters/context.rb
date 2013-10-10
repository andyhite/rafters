module Rafters::Context
  extend ActiveSupport::Concern

  included do
    attr_accessor :rendered_components
    helper_method :rendered_components
    helper_method :components_for_action
    helper_method :render_component
    alias_method_chain :render, :component
  end

  def render_component(name, options = {})
    component = component(name, options)
    component_renderer.render(component)
  end

  def render_with_component(*args, &block)
    if params[:component]
      component, options = params[:component], params[:options]

      respond_to do |format|
        format.html { render_without_component(text: render_component(component, options)) }
      end
    else
      render_without_component(*args, &block)
    end
  end

  def initialized_components
    @initialized_components ||= {}
  end

  def rendered_components_map
    @@rendered_components_map ||= Hash.new({})
  end

  def components_for_action
    rendered_components_map[controller_name][action_name] ||= {}
  end

  private

  def component_renderer
    @_component_renderer ||= Rafters::Renderer.new(self, view_context)
  end

  def component(name, options = {})
    component_klass = "#{name}_component".classify.constantize
    component = component_klass.new(options.delete(:as), options)
    self.initialized_components[component.identifier] || component
  end
end
